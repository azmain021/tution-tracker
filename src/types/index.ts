export interface Student {
  id: string;
  tutor_id: string;
  name: string;
  subject: string;
  monthly_target_visits: number;
  notes?: string;
  is_archived: boolean;
  monthly_fee: number;
  currency: string;
  email?: string;           // student's login email (set by tutor)
  student_user_id?: string; // linked Supabase auth user id
  created_at: string;
}

export interface Visit {
  id: string;
  student_id: string;
  tutor_id: string;
  visit_date: string; // YYYY-MM-DD
  visited_at: string;
  payment_status: 'unpaid' | 'paid' | 'partial';
  notes?: string;
}

export interface MonthlySummary {
  id: string;
  student_id: string;
  year: number;
  month: number;
  total_visits: number;
  target_visits: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalVisitsThisMonth: number;
  currentMonth: string;
}

export interface Tutor {
  id: string;
  username: string;
  full_name?: string;
  created_at: string;
}
