'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getStudent } from '@/lib/students';
import { getVisitsForMonth, getVisitDetails, getTodayString } from '@/lib/visits';
import { Student, Visit } from '@/types';
import CalendarView from '@/components/CalendarView';
import BottomNav from '@/components/BottomNav';

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [visitDates, setVisitDates] = useState<string[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
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

      try {
        const studentData = await getStudent(studentId);
        if (!studentData) {
          router.push('/students');
          return;
        }

        setStudent(studentData);

        const dates = await getVisitsForMonth(studentId, currentYear, currentMonth);
        setVisitDates(dates);

        const visitDetails = await getVisitDetails(studentId, currentYear, currentMonth);
        setVisits(visitDetails);
      } catch (error) {
        console.error('Error fetching student:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, studentId, currentMonth, currentYear]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-transparent border-t-accent" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-text-muted">Student not found</p>
      </div>
    );
  }

  const todayStr = getTodayString();
  const todayVisited = visitDates.includes(todayStr);

  return (
    <div className="bg-bg-primary min-h-screen pb-28">
      <div className="p-6 max-w-[430px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-text-muted hover:text-text-primary transition-colors p-2 -ml-2"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text-primary">{student.name}</h1>
            <p className="text-text-muted">{student.subject}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-xs text-text-muted mb-2">Total Visits</p>
            <p className="text-2xl font-bold text-accent">{visitDates.length}</p>
          </div>
          <div className="bg-bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-xs text-text-muted mb-2">Target</p>
            <p className="text-2xl font-bold text-accent">
              {student.monthly_target_visits}
            </p>
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {format(new Date(), 'MMMM yyyy')}
          </h2>
          <CalendarView
            year={currentYear}
            month={currentMonth}
            visitDates={visitDates}
          />
        </div>

        {/* Visit History */}
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Visit History
          </h2>
          {visits.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">
              No visits recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="bg-bg-card border border-border rounded-lg p-4 flex justify-between items-start"
                >
                  <div>
                    <p className="font-medium text-text-primary">
                      {format(new Date(visit.visit_date), 'EEEE, MMMM d')}
                    </p>
                    <p className="text-sm text-text-muted">
                      {format(new Date(visit.visited_at), 'p')}
                    </p>
                  </div>
                  {visit.notes && (
                    <p className="text-xs text-text-muted text-right max-w-xs">
                      {visit.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        {student.notes && (
          <div className="mt-8 bg-bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-text-muted mb-2">Notes</p>
            <p className="text-text-primary text-sm">{student.notes}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
