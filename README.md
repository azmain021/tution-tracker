# TutorTrack — Home Tutor Visit Tracker

A full-stack, mobile-first web application for private home tutors to track student visit days per month.

## Features

- **Student Management**: Add, edit, and archive students
- **Visit Tracking**: Long-press to quickly record visits with a satisfying animation
- **Calendar View**: See all visits for a student in a calendar grid
- **Monthly Reports**: Track this month vs. last month with trend indicators and 6-month history charts
- **Dashboard**: Real-time stats showing total students, visits this month, and active days
- **Authentication**: Secure login with Supabase Auth
- **Mobile-First**: Responsive design optimized for mobile browsers
- **Dark Theme**: Beautiful dark interface with amber accents

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **UI Components**: Lucide React for icons
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project

## Installation

### 1. Clone and Install Dependencies

```bash
cd tutor-tracker
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the SQL schema from `SQL_SCHEMA.md`
3. Copy your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    layout.tsx           # Root layout
    page.tsx             # Auth redirect
    login/page.tsx       # Login with email
    dashboard/page.tsx   # Dashboard with student cards
    students/
      page.tsx           # Student management
      [id]/page.tsx      # Student detail & calendar
    reports/page.tsx     # Monthly reports & trends
  components/
    StudentCard.tsx           # Student card with long-press
    CalendarView.tsx          # Calendar grid
    StudentModal.tsx          # Add/Edit modal
    BottomNav.tsx             # Navigation tabs
    StatsBar.tsx              # Dashboard stats
    VisitConfirmAnimation.tsx # Success animation
  lib/
    supabase.ts          # Supabase client
    visits.ts            # Visit logic
    students.ts          # Student CRUD
  types/
    index.ts             # TypeScript interfaces
```

## Key Features

### Long-Press to Record Visit (Mobile UX)

- Hold on a student card for 1 second
- Animated ring fills around the card
- Green checkmark appears on success
- Handles duplicate visits gracefully

### Calendar View

- Monthly grid with visited dates highlighted
- Today's date circled if not visited
- Tap to view full visit history

### Reports

- This month vs. last month comparison
- Trend indicator (up/down/same)
- 6-month bar chart showing visit history
- One card per active student

### Responsive Design

- Mobile-first approach
- Fixed bottom navigation
- Touch targets minimum 48px
- No horizontal scroll

## UI Design

```css
Dark background: #0A0A0A
Cards: #1C1C1E
Accents: #F59E0B (Amber)
Success: #22C55E (Green)
Text primary: #F5F5F5
Text muted: #8E8E93
Borders: #3A3A3C
```

## Database Schema

### Tables

- **tutors**: Maps to Supabase auth users
- **students**: Student details with target visits and fees
- **visits**: Individual visit records with dates
- **monthly_summaries**: Aggregated monthly data for reports

All tables use Row Level Security (RLS) to ensure tutors only see their own data.

## Deployment

### Vercel

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

```bash
vercel --prod
```

## Troubleshooting

### "Not authenticated" error

- Check your Supabase credentials in `.env.local`
- Verify email in Supabase Auth Users

### Visits not syncing

- Check browser console for errors
- Verify Supabase RLS policies allow your user
- Check database records in Supabase dashboard

### Long-press not working on desktop

- Try in a touch-enabled device or use browser DevTools mobile emulation
- Both mouse and touch events are supported

## Future Enhancements

- Payment tracking and invoicing
- Multiple tutors per account
- Student performance metrics
- Recurring visit scheduling
- Export reports to PDF
- Email reminders
- Dark/light theme toggle
- Offline support with sync

## License

MIT

## Support

For issues or questions, check the Supabase documentation or contact your Supabase support team.
