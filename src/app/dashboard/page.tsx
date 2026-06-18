'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { getStudents } from '@/lib/students';
import { getVisitCountForMonth } from '@/lib/visits';
import StudentCard from '@/components/StudentCard';
import StatsBar from '@/components/StatsBar';
import BottomNav from '@/components/BottomNav';
import { Student } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [totalVisits, setTotalVisits] = useState(0);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthYear = format(now, 'MMMM yyyy');

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

      // Ensure tutor profile exists (handles cases where signup succeeded
      // but the tutor row was never created due to connection issues)
      try {
        const { data: existingTutor } = await supabase
          .from('tutors')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!existingTutor) {
          await supabase.from('tutors').insert({
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'tutor',
            full_name: session.user.user_metadata?.full_name || '',
          });
        }
      } catch {
        // If select fails (no row), attempt insert
        await supabase.from('tutors').insert({
          id: session.user.id,
          username: session.user.email?.split('@')[0] || 'tutor',
          full_name: session.user.user_metadata?.full_name || '',
        });
      }

      try {
        const studentList = await getStudents(session.user.id);
        setStudents(studentList);

        // Fetch visit counts for each student
        const counts: Record<string, number> = {};
        let total = 0;

        for (const student of studentList) {
          const count = await getVisitCountForMonth(
            student.id,
            currentYear,
            currentMonth
          );
          counts[student.id] = count;
          total += count;
        }

        setVisitCounts(counts);
        setTotalVisits(total);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, currentMonth, currentYear]);

  const handleVisitRecorded = async () => {
    // Refetch data
    if (user) {
      const studentList = await getStudents(user.id);
      setStudents(studentList);

      const counts: Record<string, number> = {};
      let total = 0;

      for (const student of studentList) {
        const count = await getVisitCountForMonth(
          student.id,
          currentYear,
          currentMonth
        );
        counts[student.id] = count;
        total += count;
      }

      setVisitCounts(counts);
      setTotalVisits(total);
    }
  };

  const handleNavigateToStudent = (studentId: string) => {
    router.push(`/students/${studentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-transparent border-t-accent" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Students', value: students.length },
    { label: 'Visits This Month', value: totalVisits },
    { label: 'Active Days', value: Object.values(visitCounts).filter((c) => c > 0).length },
  ];

  return (
    <div className="bg-bg-primary min-h-screen pb-28 lg:pb-10">
      <div className="p-6 max-w-[430px] mx-auto lg:ml-64 lg:max-w-none lg:p-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary lg:hidden">TutorTrack</h1>
          <p className="text-lg font-semibold text-text-primary hidden lg:block">{monthYear}</p>
          <p className="text-lg text-text-muted mt-1 lg:hidden">{monthYear}</p>
        </div>

        {/* Stats */}
        <StatsBar stats={stats} />

        {/* Students List */}
        {students.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-text-muted mb-4">No students yet</p>
            <a
              href="/students"
              className="inline-block bg-accent text-bg-primary px-6 py-3 rounded-lg font-medium transition-colors hover:bg-yellow-500"
            >
              Add Your First Student
            </a>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Your Students</h2>
            <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  visitCount={visitCounts[student.id] || 0}
                  onVisitRecorded={handleVisitRecorded}
                  onNavigate={handleNavigateToStudent}
                  tutorId={user.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Start New Month button */}
        {students.length > 0 && (
          <button className="w-full mt-8 py-3 text-text-muted border border-border rounded-lg transition-colors hover:text-text-primary hover:border-text-primary text-sm">
            Start New Month
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
