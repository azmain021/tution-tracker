-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tutors (maps to Supabase auth users)
create table tutors (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  created_at timestamptz default now()
);

-- Students
create table students (
  id uuid primary key default uuid_generate_v4(),
  tutor_id uuid not null references tutors(id) on delete cascade,
  name text not null,
  subject text not null,
  monthly_target_visits int default 0,
  notes text,
  is_archived boolean default false,
  -- Future: fee fields
  monthly_fee numeric(10,2) default 0,
  currency text default 'BDT',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Visits
create table visits (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  tutor_id uuid not null references tutors(id) on delete cascade,
  visit_date date not null,
  visited_at timestamptz default now(),
  -- Future: payment fields
  fee_paid numeric(10,2) default 0,
  payment_status text default 'unpaid', -- unpaid | paid | partial
  notes text,
  unique(student_id, visit_date) -- prevent duplicate visits per day
);

-- Monthly summaries (for reports/history)
create table monthly_summaries (
  id uuid primary key default uuid_generate_v4(),
  tutor_id uuid not null references tutors(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  year int not null,
  month int not null, -- 1–12
  total_visits int default 0,
  target_visits int default 0,
  -- Future: income tracking
  total_fees_due numeric(10,2) default 0,
  total_fees_paid numeric(10,2) default 0,
  created_at timestamptz default now(),
  unique(student_id, year, month)
);

-- Row Level Security
alter table tutors enable row level security;
alter table students enable row level security;
alter table visits enable row level security;
alter table monthly_summaries enable row level security;

create policy "Tutors own their row" on tutors
  for all using (auth.uid() = id);

create policy "Tutors own their students" on students
  for all using (auth.uid() = tutor_id);

create policy "Tutors own their visits" on visits
  for all using (auth.uid() = tutor_id);

create policy "Tutors own their summaries" on monthly_summaries
  for all using (auth.uid() = tutor_id);
