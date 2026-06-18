# TutorTrack Setup Guide

## Quick Start

### 1. **Prerequisites**
- Node.js 18 or later
- npm or yarn
- A Supabase account (free tier is fine)

### 2. **Install Node.js**

**Windows:**
- Download from [nodejs.org](https://nodejs.org)
- Run installer and follow prompts
- Verify: Open PowerShell and run `node --version` and `npm --version`

**Mac:**
```bash
brew install node
```

**Linux:**
```bash
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install nodejs
```

### 3. **Set Up Supabase**

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the project to initialize
4. Go to **SQL Editor** → Click **+ New query**
5. Copy and paste the entire SQL schema from `SQL_SCHEMA.md`
6. Click **Run** to execute all the SQL

### 4. **Get Your Credentials**

In your Supabase dashboard:
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. **Configure Environment Variables**

1. Open the `tutor-tracker` folder
2. Create a file named `.env.local` (if not exists)
3. Add your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Save the file

### 6. **Install Dependencies**

```bash
cd tutor-tracker
npm install
```

This will install all required packages:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase JS client
- date-fns
- lucide-react

### 7. **Run Development Server**

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### 8. **First Login**

1. Click "Sign up"
2. Enter your email and password
3. You'll be automatically added to the `tutors` table
4. Navigate to Dashboard to start adding students

## Features Overview

### Dashboard
- View current month and year
- See total students, visits, and active days
- Long-press any student card to record a visit instantly
- Tap card to view detailed calendar

### Students
- Add new students with name, subject, target visits, notes
- Edit student information anytime
- Archive students you're no longer tutoring
- Click any student to view calendar and visit history

### Calendar View
- Monthly grid showing all visited dates
- Visited dates highlighted in amber with checkmarks
- Today's date circled if not yet visited
- Full visit history with timestamps below calendar

### Reports
- See each student's performance
- This month vs. last month comparison
- Trend indicator showing improvement/decline
- 6-month bar chart visualization
- Compare students side by side

## Mobile Usage (Important!)

The app is optimized for mobile. For best experience:

1. **iPhone/iPad**: Add to Home Screen
   - Open Safari
   - Tap Share → Add to Home Screen
   - Use the app like a native app

2. **Android**: Add to Home Screen
   - Open Chrome
   - Menu → Install app
   - Or tap Share → Add to Home Screen

3. **Desktop**: Use in a desktop browser for development/testing

## Long-Press Feature

The core feature for recording visits:

1. Find a student card on Dashboard
2. **Hold and don't release** for 1 second
3. Watch for animated ring around card
4. Release when complete - green checkmark appears
5. Visit is instantly recorded in Supabase

**What if I already visited today?**
- System prevents duplicates
- Shows message "Already visited today"
- You can choose to record anyway if needed

## Keyboard Shortcuts (Desktop)

- Coming soon (can be added in future versions)

## Troubleshooting

### "Module not found" errors
```bash
rm -r node_modules
npm install
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Environment variables not loading
- Make sure `.env.local` is in the root `tutor-tracker` folder
- Restart dev server after changing `.env.local`
- Check for typos in variable names

### Database connection errors
1. Verify credentials in `.env.local`
2. Check Supabase project is active
3. Confirm SQL schema was executed
4. Check RLS policies are enabled

### Visits not saving
- Check browser's Network tab (F12) for errors
- Verify tutor user exists in Supabase dashboard
- Check student's tutor_id matches your user ID

## File Structure

```
tutor-tracker/
├── public/                    # Static files
├── src/
│   ├── app/                  # Next.js app router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Auth redirect
│   │   ├── login/            # Login page
│   │   ├── dashboard/        # Main dashboard
│   │   ├── students/         # Student management
│   │   └── reports/          # Analytics
│   ├── components/           # React components
│   │   ├── StudentCard.tsx   # Long-press visit recording
│   │   ├── CalendarView.tsx  # Monthly calendar
│   │   ├── StudentModal.tsx  # Add/Edit form
│   │   ├── BottomNav.tsx     # Navigation
│   │   └── ...
│   ├── lib/                  # Utilities
│   │   ├── supabase.ts       # Supabase client
│   │   ├── visits.ts         # Visit logic
│   │   └── students.ts       # Student CRUD
│   ├── types/                # TypeScript types
│   └── styles/               # CSS
├── .env.local                # Your environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## Deploying to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/tutor-tracker.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click Deploy

### Step 3: Done!
Your app is live! Share the URL with your students.

## Performance Tips

1. **Caching**: Student list is cached locally
2. **Images**: Use avatar images with Supabase Storage (future feature)
3. **Offline**: Works without internet (visits sync when online)

## Data Privacy

- All data is encrypted in transit (HTTPS)
- Supabase uses Row Level Security (RLS)
- Only you see your student data
- No third-party analytics

## Support & Issues

1. **Check browser console**: F12 → Console tab
2. **Check Supabase dashboard**: Verify data exists
3. **Check network tab**: Look for failed requests
4. **Restart dev server**: `npm run dev`

## Next Steps After Setup

1. ✅ Add your first student
2. ✅ Test long-press visit recording
3. ✅ Check calendar view
4. ✅ Review reports
5. ✅ Deploy to Vercel
6. ✅ Add to home screen on phone

Enjoy tracking your tutoring! 🎓
