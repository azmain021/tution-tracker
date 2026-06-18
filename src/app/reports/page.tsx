'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, subMonths } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getStudents } from '@/lib/students';
import { getVisitCountForMonth } from '@/lib/visits';
import { Student } from '@/types';
import BottomNav from '@/components/BottomNav';

interface StudentReport {
  student: Student;
  thisMonth: number;
  lastMonth: number;
  trend: 'up' | 'down' | 'same';
  last6Months: number[];
}

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);

  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Generate reports for this tutor
      const generateReports = async (tutorId: string) => {
        try {
          const students = await getStudents(tutorId);

          const reportsData: StudentReport[] = [];

          for (const student of students) {
            // Current month
            const thisMonth = await getVisitCountForMonth(
              student.id,
              currentYear,
              currentMonth
            );

            // Last month
            const lastMonthDate = subMonths(new Date(currentYear, currentMonth - 1), 1);
            const lastMonth = await getVisitCountForMonth(
              student.id,
              lastMonthDate.getFullYear(),
              lastMonthDate.getMonth() + 1
            );

            // Last 6 months
            const last6Months: number[] = [];
            for (let i = 5; i >= 0; i--) {
              const date = subMonths(now, i);
              const count = await getVisitCountForMonth(
                student.id,
                date.getFullYear(),
                date.getMonth() + 1
              );
              last6Months.push(count);
            }

            // Trend
            let trend: 'up' | 'down' | 'same' = 'same';
            if (thisMonth > lastMonth) trend = 'up';
            else if (thisMonth < lastMonth) trend = 'down';

            reportsData.push({
              student,
              thisMonth,
              lastMonth,
              trend,
              last6Months,
            });
          }

          setReports(reportsData);
        } catch (error) {
          console.error('Error generating reports:', error);
        } finally {
          setLoading(false);
        }
      };

      await generateReports(session.user.id);
    };

    checkAuth();
  }, [router, currentMonth, currentYear, now]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-transparent border-t-accent" />
      </div>
    );
  }

  const maxVisits = Math.max(
    ...reports.flatMap((r) => r.last6Months),
    1
  );

  return (
    <div className="bg-bg-primary min-h-screen pb-28 lg:pb-10">
      <div className="p-6 max-w-[430px] mx-auto lg:ml-64 lg:max-w-none lg:p-10">
        {/* Header */}
        <h1 className="text-3xl font-bold text-text-primary mb-8">Reports</h1>

        {/* Report Cards */}
        {reports.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-text-muted">No student data available</p>
          </div>
        ) : (
          <div className="space-y-6 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6 lg:space-y-0">
            {reports.map((report) => (
              <div
                key={report.student.id}
                className="bg-bg-card border border-border rounded-2xl p-6"
              >
                {/* Student name */}
                <h2 className="text-lg font-bold text-text-primary mb-4">
                  {report.student.name}
                </h2>

                {/* Current stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-text-muted mb-1">This Month</p>
                    <p className="text-2xl font-bold text-accent">
                      {report.thisMonth}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Last Month</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {report.lastMonth}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Trend</p>
                    <div className="flex items-center gap-1">
                      {report.trend === 'up' && (
                        <>
                          <TrendingUp size={20} className="text-success" />
                          <span className="text-success font-bold">+{report.thisMonth - report.lastMonth}</span>
                        </>
                      )}
                      {report.trend === 'down' && (
                        <>
                          <TrendingDown size={20} className="text-red-500" />
                          <span className="text-red-500 font-bold">{report.thisMonth - report.lastMonth}</span>
                        </>
                      )}
                      {report.trend === 'same' && (
                        <>
                          <Minus size={20} className="text-text-muted" />
                          <span className="text-text-muted font-bold">0</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 6-month chart */}
                <div>
                  <p className="text-xs text-text-muted mb-3">Last 6 Months</p>
                  <div className="flex items-end gap-2 h-24">
                    {report.last6Months.map((count, idx) => {
                      const height = maxVisits > 0 ? (count / maxVisits) * 100 : 0;
                      const isCurrentMonth = idx === report.last6Months.length - 1;
                      return (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div
                            className={`w-full rounded-t transition-colors ${
                              isCurrentMonth
                                ? 'bg-accent hover:bg-yellow-500'
                                : 'bg-text-muted/30 hover:bg-text-muted/50'
                            }`}
                            style={{ height: `${Math.max(height, 8)}px` }}
                            title={`${count} visits`}
                          />
                          <span className="text-xs text-text-muted">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-text-muted">
                    <span>6 months ago</span>
                    <span>This month</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
