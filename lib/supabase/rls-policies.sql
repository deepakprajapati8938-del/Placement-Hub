-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Everyone read tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Admin insert/update tasks" ON tasks FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE full_name ILIKE '%admin%')
);

-- Notes policies
CREATE POLICY "Users read notes" ON notes FOR SELECT USING (true);
CREATE POLICY "Admin manage notes" ON notes FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE full_name ILIKE '%admin%')
);

-- User tasks policies
CREATE POLICY "Users manage own tasks" ON user_tasks FOR ALL USING (auth.uid() = user_id);

-- Leaderboard rank view
CREATE OR REPLACE VIEW leaderboard_rank AS
SELECT 
  p.id, 
  p.full_name, 
  p.avatar_slug, 
  p.xp,
  (SELECT COUNT(*) FROM profiles WHERE xp > p.xp) + 1 AS rank,
  (SELECT COUNT(*) FROM tasks t 
   LEFT JOIN user_tasks ut ON t.id = ut.task_id 
   WHERE ut.user_id = p.id AND t.is_backlog = true) AS backlog_count
FROM profiles p;
