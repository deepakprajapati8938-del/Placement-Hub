# 🚀 Setup Instructions for Placement Prep Hub

## 📋 Prerequisites
- Node.js 18+ installed
- Supabase account created
- Git initialized

## 🔧 Environment Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name your project: `placement-hub`
4. Choose organization (or create new one)
5. Wait for project to be created

### 2. Get Supabase Credentials
1. Go to Project Settings → API
2. Copy the **Project URL** and **Anon Key**
3. Go to Project Settings → Database → Settings
4. Copy the **Service Role Key** (for server operations)

### 3. Configure Environment Variables
1. Copy `.env.local.example` to `.env.local`
2. Fill in your actual Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Add optional services:
   ```env
   RESEND_API_KEY=your-resend-key  # For email
   POSTHOG_KEY=your-posthog-key    # For analytics
   ```

### 4. Database Setup
1. Run the SQL from `lib/supabase/rls-policies.sql` in Supabase SQL Editor
2. Or use Supabase CLI: `supabase db push`

### 5. Start Development
```bash
npm run dev
```

## 🗄️ Database Schema
The following tables will be created automatically:
- `profiles` - User profiles with XP and streaks
- `tasks` - Task definitions with priorities and deadlines
- `user_tasks` - User task progress and completion status
- `notes` - Study materials with view tracking

## 🔐 Security Notes
- Never commit `.env.local` to version control
- Add `.env.local` to `.gitignore`
- Use service role key only for server-side operations

## 🚀 Deployment
1. Push to Git repository
2. Deploy to Netlify
3. Set environment variables in Netlify dashboard

## 📞 Troubleshooting
If you see Supabase connection errors:
1. Verify environment variables are correctly set
2. Check Supabase project status
3. Ensure RLS policies are applied
4. Clear browser cache and restart dev server

## 📚 Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
