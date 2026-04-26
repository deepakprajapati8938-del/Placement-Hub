# 🌌 Placement Hub:

**Placement Hub** is a premium, high-performance web application designed to streamline the campus placement preparation journey. Featuring a stunning **Aurora Glassmorphism** design system, it provides students with a gamified roadmap, real-time leaderboard, and curated study resources.

---

## ✨ Key Features

### 🎨 Premium UI/UX
- **Aurora Glassmorphism**: A state-of-the-art design system using vibrant gradients, mesh blurs, and glass cards.
- **Dynamic Animations**: Smooth transitions and micro-interactions powered by Framer Motion.
- **Dark/Light Modes**: Curated color palettes for both high-contrast productivity and sleek night mode.

### 🏆 Gamified Progress
- **Real-Time Leaderboard**: Compete with peers globally. Rankings update instantly as you earn XP.
- **XP & Streak System**: Earn experience points by completing tasks and maintain daily streaks to stay motivated.
- **Avatar System**: Customize your profile with unique high-quality avatars.

### 🗺️ Intelligent Roadmaps
- **Dynamic Timeline**: A structured journey through Technical, Aptitude, and HR interview stages.
- **Phase-Based Tasks**: Tasks are grouped into logical phases (e.g., DSA Basics, Core CS, System Design).
- **Backlog Management**: Automatically tracks missed deadlines to keep you on schedule.

### 📚 Resource Repository
- **Study Notes**: Access curated materials for DSA, OS, DBMS, and behavioral interviews.
- **View Tracking**: See which resources are trending among your peers.
- **Atomic Sync**: All progress and notes are synced in real-time via Supabase.

### 🛡️ Admin Suite
- **Role-Based Access**: Exclusive access to administrative tools for authorized emails.
- **Task Manager**: Admins can create, edit, and assign tasks across the global roadmap.
- **Roadmap Builder**: Visualize and edit the preparation timeline dynamically.

---

## 🛠️ Technology Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), Vanilla CSS (Aurora Design System)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Real-time)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ 
- npm or pnpm
- A Supabase account

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/placement-hub.git

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Run the SQL provided in `lib/supabase/functions.sql` in your Supabase SQL Editor to initialize:
- Tables: `profiles`, `tasks`, `user_tasks`, `notes`
- Materialized Views: `leaderboard_rank`
- Triggers & Functions for XP calculation and auto-profile creation.

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔒 Security
- **Admin Access**: Restricted to authorized emails (e.g., `dp7800549@gmail.com`) via route-level protection.
- **Data Integrity**: Atomic database functions ensure XP and view counts remain consistent.
- **Secure Auth**: Powered by Supabase Auth with Row Level Security (RLS).

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🖥️🛫 Experience Live on : https://placement-zone.netlify.app/

## 👥 Authors

- **Deepak Prajapati**
- **Saksham Tamrakar**

Developed with ❤️ for the placement prep community.
