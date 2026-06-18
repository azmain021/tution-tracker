'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, subMonths, getDaysInMonth, startOfMonth, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, TrendingUp, TrendingDown, Minus, BookOpen, CalendarDays, Target, Banknote } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StudentRecord {
  id: string;
  name: string;
  subject: string;
  monthly_target_visits: number;
  monthly_fee: number;
  currency: string;
  tutor_name?: string;
}

interface VisitRecord {
  visit_date: string;
}

export default function StudentAttendancePage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const currentMonth = viewDate.getMonth() + 1;
  const currentYear = viewDate.getFullYear();
  const monthLabel = format(viewDate, 'MMMM yyyy');

  // Fetch the student's own records
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/student-login');
          return;
        }

        const { data: studentData, error } = await supabase
          .from('students')
          .select('id, name, subject, monthly_target_visits, monthly_fee, currency')
          .eq('student_user_id', session.user.id)
          .eq('is_archived', false);

        if (error) throw error;

        if (!studentData || studentData.length === 0) {
          router.push('/student-login');
          return;
        }

        setStudents(studentData);
        setSelectedStudentId(studentData[0].id);
      } catch (err) {
        console.error('Error loading student data:', err);
        router.push('/student-login');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  // Fetch visits whenever student or month changes
  useEffect(() => {
    if (!selectedStudentId) return;

    const fetchVisits = async () => {
      setVisitsLoading(true);
      try {
        const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth - 1));
        const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${daysInMonth}`;

        const { data, error } = await supabase
          .from('visits')
          .select('visit_date')
          .eq('student_id', selectedStudentId)
          .gte('visit_date', startDate)
          .lte('visit_date', endDate)
          .order('visit_date', { ascending: true });

        if (error) throw error;
        setVisits(data || []);
      } catch (err) {
        console.error('Error fetching visits:', err);
      } finally {
        setVisitsLoading(false);
      }
    };

    fetchVisits();
  }, [selectedStudentId, currentMonth, currentYear]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId),
    [students, selectedStudentId]
  );

  const visitedDates = useMemo(
    () => new Set(visits.map((v) => v.visit_date)),
    [visits]
  );

  const visitCount = visits.length;
  const targetVisits = selectedStudent?.monthly_target_visits || 1;
  const progressPercent = Math.min((visitCount / targetVisits) * 100, 100);

  // Calendar grid
  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth - 1));
  const firstDayOfWeek = getDay(startOfMonth(new Date(currentYear, currentMonth - 1)));
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const prevMonth = () => setViewDate(subMonths(viewDate, 1));
  const nextMonth = () => {
    const next = new Date(viewDate);
    next.setMonth(viewDate.getMonth() + 1);
    if (next <= new Date()) setViewDate(next);
  };
  const isCurrentMonth = viewDate.getMonth() === new Date().getMonth() &&
    viewDate.getFullYear() === new Date().getFullYear();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-transparent border-t-accent" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto pb-12">

      {/* Student selector (if linked to multiple tutors) */}
      {students.length > 1 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStudentId(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStudentId === s.id
                  ? 'bg-accent text-bg-primary'
                  : 'bg-bg-card border border-border text-text-muted hover:text-text-primary'
              }`}
            >
              {s.subject}
            </button>
          ))}
        </div>
      )}

      {/* Student info header */}
      {selectedStudent && (
        <div className="bg-bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex-shrink-0">
              <BookOpen size={22} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-text-primary">{selectedStudent.name}</h1>
              <p className="text-text-muted text-sm">{selectedStudent.subject}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CalendarDays size={14} className="text-accent" />
              </div>
              <p className="text-2xl font-bold text-accent">{visitCount}</p>
              <p className="text-xs text-text-muted">This month</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target size={14} className="text-text-muted" />
              </div>
              <p className="text-2xl font-bold text-text-primary">{targetVisits}</p>
              <p className="text-xs text-text-muted">Target</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Banknote size={14} className="text-text-muted" />
              </div>
              <p className="text-lg font-bold text-text-primary">
                {selectedStudent.monthly_fee > 0
                  ? `${selectedStudent.monthly_fee} ${selectedStudent.currency}`
                  : '—'}
              </p>
              <p className="text-xs text-text-muted">Monthly fee</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-bg-card-hover rounded-full h-2.5 overflow-hidden border border-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercent >= 100 ? 'bg-green-500' : 'bg-accent'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-text-muted mt-1 text-right">
              {targetVisits - visitCount > 0
                ? `${targetVisits - visitCount} visits remaining`
                : '🎉 Target reached!'}
            </p>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-bg-card border border-border rounded-2xl p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-semibold text-text-primary">{monthLabel}</h2>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center text-xs text-text-muted py-1 font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        {visitsLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-transparent border-t-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Empty leading cells */}
            {emptyDays.map((i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {calendarDays.map((day) => {
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isVisited = visitedDates.has(dateStr);
              const isToday =
                dateStr === format(new Date(), 'yyyy-MM-dd');

              return (
                <div
                  key={day}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all ${
                    isVisited
                      ? 'bg-accent/15 text-accent font-semibold ring-1 ring-accent/40'
                      : isToday
                      ? 'bg-bg-card-hover text-text-primary font-semibold ring-1 ring-border'
                      : 'text-text-muted'
                  }`}
                >
                  <span>{day}</span>
                  {isVisited && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-accent/20 ring-1 ring-accent/40" />
            <span>Visit recorded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-bg-card-hover ring-1 ring-border" />
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Visit list */}
      {visits.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-text-muted mb-3">
            All visits in {monthLabel}
          </h3>
          <div className="space-y-2">
            {visits.map((v, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-bg-card border border-border rounded-lg px-4 py-3"
              >
                <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  {format(new Date(v.visit_date + 'T00:00:00'), 'EEEE, MMMM d')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {visits.length === 0 && !visitsLoading && (
        <div className="mt-6 bg-bg-card border border-border rounded-2xl p-8 text-center">
          <Circle size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">No visits recorded for {monthLabel}</p>
        </div>
      )}
    </div>
  );
}
