-- Create tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  avatar_slug TEXT DEFAULT 'default',
  xp BIGINT DEFAULT 0,
  streak INTEGER DEFAULT 0,
  target_companies TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  deadline TIMESTAMP,
  target_stage TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_tasks (
  user_id UUID REFERENCES profiles(id),
  task_id UUID REFERENCES tasks(id),
  status TEXT DEFAULT 'pending',
  reschedule_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  PRIMARY KEY (user_id, task_id)
);

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  target_stage TEXT,
  tags TEXT[],
  view_count BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_rank AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY p.xp DESC) as rank,
  p.id as user_id,
  p.full_name,
  p.avatar_slug,
  p.xp,
  COUNT(CASE WHEN ut.status = 'pending' AND t.deadline < NOW() THEN 1 END) as backlog_count
FROM profiles p
LEFT JOIN user_tasks ut ON p.id = ut.user_id
LEFT JOIN tasks t ON ut.task_id = t.id
WHERE p.xp > 0
GROUP BY p.id, p.full_name, p.avatar_slug, p.xp
ORDER BY p.xp DESC;

-- Refresh leaderboard rank materialized view
CREATE OR REPLACE FUNCTION refresh_leaderboard_rank()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Refresh the materialized view with updated user rankings
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_rank;
END;
$$;

-- Increment note view count
CREATE OR REPLACE FUNCTION increment_note_view_count(note_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE notes 
  SET view_count = view_count + 1 
  WHERE id = note_id;
END;
$$;

-- Calculate user XP and update profile
CREATE OR REPLACE FUNCTION update_user_xp(user_id UUID, xp_change INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles 
  SET xp = GREATEST(xp + xp_change, 0)
  WHERE id = user_id;
END;
$$;

-- Get user task statistics
CREATE OR REPLACE FUNCTION get_user_task_stats(user_id UUID)
RETURNS TABLE (
  total_tasks BIGINT,
  completed_tasks BIGINT,
  pending_tasks BIGINT,
  overdue_tasks BIGINT,
  current_streak INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN ut.status = 'done' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN ut.status = 'pending' THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN ut.status = 'pending' AND t.deadline < NOW() THEN 1 END) as overdue_tasks,
    COALESCE(p.streak, 0) as current_streak
  FROM user_tasks ut
  LEFT JOIN tasks t ON ut.task_id = t.id
  LEFT JOIN profiles p ON ut.user_id = p.id
  WHERE ut.user_id = user_id;
END;
$$;

-- Create user task if not exists
CREATE OR REPLACE FUNCTION create_user_task_if_not_exists(user_id UUID, task_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_tasks (user_id, task_id, status, created_at)
  VALUES (user_id, task_id, 'pending', NOW())
  ON CONFLICT (user_id, task_id) DO NOTHING;
END;
$$;

-- Mark task as complete and award XP
CREATE OR REPLACE FUNCTION complete_task_and_award_xp(user_id UUID, task_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  xp_awarded INTEGER,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  task_record RECORD;
  base_xp INTEGER := 10;
  days_overdue INTEGER := 0;
  xp_awarded INTEGER;
BEGIN
  -- Get task details
  SELECT * INTO task_record FROM tasks WHERE id = task_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'Task not found';
    RETURN;
  END IF;
  
  -- Calculate overdue penalty
  IF task_record.deadline IS NOT NULL THEN
    days_overdue := GREATEST(EXTRACT(DAYS FROM NOW() - task_record.deadline), 0);
    xp_awarded := GREATEST(base_xp - (2 * days_overdue), -10);
  ELSE
    xp_awarded := base_xp;
  END IF;
  
  -- Update user task status
  UPDATE user_tasks 
  SET status = 'done', completed_at = NOW()
  WHERE user_id = user_id AND task_id = task_id;
  
  -- Award XP
  PERFORM update_user_xp(user_id, xp_awarded);
  
  RETURN QUERY SELECT TRUE, xp_awarded, 'Task completed successfully';
END;
$$;

-- Reschedule task
CREATE OR REPLACE FUNCTION reschedule_task(user_id UUID, task_id UUID, days_ahead INTEGER DEFAULT 3)
RETURNS TABLE (
  success BOOLEAN,
  new_deadline TIMESTAMP,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  reschedule_count INTEGER;
  task_record RECORD;
  new_deadline TIMESTAMP;
BEGIN
  -- Get current reschedule count
  SELECT ut.reschedule_count INTO reschedule_count
  FROM user_tasks ut
  WHERE ut.user_id = user_id AND ut.task_id = task_id;
  
  -- Check if user has exceeded reschedule limit
  IF reschedule_count >= 2 THEN
    RETURN QUERY SELECT FALSE, NULL, 'Maximum reschedule limit reached';
    RETURN;
  END IF;
  
  -- Get task details
  SELECT * INTO task_record FROM tasks WHERE id = task_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL, 'Task not found';
    RETURN;
  END IF;
  
  -- Calculate new deadline
  new_deadline := NOW() + (days_ahead || ' days')::INTERVAL;
  
  -- Update task deadline
  UPDATE tasks 
  SET deadline = new_deadline
  WHERE id = task_id;
  
  -- Increment reschedule count
  UPDATE user_tasks 
  SET reschedule_count = reschedule_count + 1
  WHERE user_id = user_id AND task_id = task_id;
  
  RETURN QUERY SELECT TRUE, new_deadline, 'Task rescheduled successfully';
END;
$$;

-- Get leaderboard with user context
CREATE OR REPLACE FUNCTION get_leaderboard_with_context(current_user_id UUID, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  full_name TEXT,
  avatar_slug TEXT,
  xp BIGINT,
  backlog_count BIGINT,
  is_current_user BOOLEAN,
  relative_position BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_rank BIGINT;
BEGIN
  -- Get current user rank once
  SELECT lr.rank INTO current_user_rank 
  FROM leaderboard_rank lr 
  WHERE lr.user_id = current_user_id;

  RETURN QUERY
  SELECT 
    lr.rank,
    lr.user_id,
    lr.full_name,
    lr.avatar_slug,
    lr.xp,
    lr.backlog_count,
    lr.user_id = current_user_id as is_current_user,
    COALESCE(current_user_rank - lr.rank, 0) as relative_position
  FROM leaderboard_rank lr
  ORDER BY lr.rank ASC
  LIMIT limit_count;
END;
$$;

-- Get user dashboard summary
CREATE OR REPLACE FUNCTION get_user_dashboard_summary(user_id UUID)
RETURNS TABLE (
  total_tasks BIGINT,
  completed_tasks BIGINT,
  pending_tasks BIGINT,
  overdue_tasks BIGINT,
  total_xp BIGINT,
  current_streak INTEGER,
  recent_task_id UUID,
  recent_title TEXT,
  recent_priority TEXT,
  recent_deadline TIMESTAMP,
  recent_status TEXT,
  recent_is_backlog BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT * FROM get_user_task_stats(user_id)
  ),
  recent_tasks_data AS (
    SELECT 
      t.id as task_id,
      t.title,
      t.priority,
      t.deadline,
      ut.status,
      CASE WHEN t.deadline < NOW() AND ut.status != 'done' THEN true ELSE false END as is_backlog
    FROM user_tasks ut
    JOIN tasks t ON ut.task_id = t.id
    WHERE ut.user_id = user_id
    ORDER BY t.deadline ASC NULLS LAST
    LIMIT 10
  )
  SELECT 
    us.total_tasks,
    us.completed_tasks,
    us.pending_tasks,
    us.overdue_tasks,
    (SELECT xp FROM profiles WHERE id = user_id) as total_xp,
    us.current_streak,
    rtd.task_id as recent_task_id,
    rtd.title as recent_title,
    rtd.priority as recent_priority,
    rtd.deadline as recent_deadline,
    rtd.status as recent_status,
    rtd.is_backlog as recent_is_backlog
  FROM user_stats us
  CROSS JOIN recent_tasks_data rtd
  LIMIT 1;
END;
$$;

-- Increment note view count atomically
DROP FUNCTION IF EXISTS increment_note_view_count(UUID);
CREATE OR REPLACE FUNCTION increment_note_view_count(target_note_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notes
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = target_note_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION refresh_leaderboard_rank() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_leaderboard_rank() TO service_role;

GRANT EXECUTE ON FUNCTION increment_note_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_note_view_count(UUID) TO service_role;

GRANT EXECUTE ON FUNCTION update_user_xp(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_xp(UUID, INTEGER) TO service_role;

GRANT EXECUTE ON FUNCTION get_user_task_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_task_stats(UUID) TO service_role;

GRANT EXECUTE ON FUNCTION create_user_task_if_not_exists(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_task_if_not_exists(UUID, UUID) TO service_role;

GRANT EXECUTE ON FUNCTION complete_task_and_award_xp(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_task_and_award_xp(UUID, UUID) TO service_role;

GRANT EXECUTE ON FUNCTION reschedule_task(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION reschedule_task(UUID, UUID, INTEGER) TO service_role;

GRANT EXECUTE ON FUNCTION get_leaderboard_with_context(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard_with_context(UUID, INTEGER) TO service_role;

GRANT EXECUTE ON FUNCTION get_user_dashboard_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_dashboard_summary(UUID) TO service_role;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard_rank(user_id);

-- Handle new user registration (Robust Upsert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_slug, xp, streak, target_companies)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'avatar_slug', 'default'),
    0,
    0,
    ARRAY[]::TEXT[]
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_slug = EXCLUDED.avatar_slug,
    updated_at = NOW();
  
  -- Refresh the leaderboard view to include the new user
  PERFORM refresh_leaderboard_rank();
  
  RETURN new;
END;
$$;

-- Seed some mock data for the leaderboard to look alive
INSERT INTO public.profiles (id, full_name, avatar_slug, xp, streak)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Alex Rivera', 'ninja', 2450, 12),
  ('00000000-0000-0000-0000-000000000002', 'Sarah Chen', 'sage', 2100, 8),
  ('00000000-0000-0000-0000-000000000003', 'Jordan Smith', 'warrior', 1850, 5),
  ('00000000-0000-0000-0000-000000000004', 'Priya Patel', 'scholar', 1200, 3),
  ('00000000-0000-0000-0000-000000000005', 'Chris Wong', 'builder', 950, 2)
ON CONFLICT (id) DO NOTHING;

-- Seed some mock data for notes
INSERT INTO public.notes (id, title, target_stage, tags, view_count, resource_url)
VALUES 
  (gen_random_uuid(), 'Ultimate DSA Roadmap', 'Technical', ARRAY['dsa', 'roadmap'], 154, 'https://roadmap.sh/computer-science'),
  (gen_random_uuid(), 'System Design Fundamentals', 'Technical', ARRAY['system-design', 'interview'], 89, 'https://github.com/donnemartin/system-design-primer'),
  (gen_random_uuid(), 'Operating Systems Cheat Sheet', 'Technical', ARRAY['os', 'core-cs'], 120, 'https://github.com/prashant-k-sharma/operating-systems-cheat-sheet'),
  (gen_random_uuid(), 'HR Interview Guide', 'HR', ARRAY['behavioral', 'interview'], 245, 'https://www.careercup.com/page?pid=hr-interview-questions'),
  (gen_random_uuid(), 'DBMS Interview Questions', 'Technical', ARRAY['dbms', 'sql'], 67, 'https://www.interviewbit.com/dbms-interview-questions/')
ON CONFLICT DO NOTHING;

-- Initial refresh
SELECT refresh_leaderboard_rank();

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Automatically refresh leaderboard on XP change
CREATE OR REPLACE FUNCTION public.handle_xp_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (OLD.xp IS DISTINCT FROM NEW.xp) THEN
    PERFORM refresh_leaderboard_rank();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_xp_change ON public.profiles;
CREATE TRIGGER on_profile_xp_change
  AFTER UPDATE OF xp ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_xp_change();
