import { format } from 'date-fns';
import { supabase } from './supabase';

/**
 * Get today's date as 'YYYY-MM-DD' in local time
 */
export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Record a visit for a student on a specific date
 * Checks for duplicates and returns appropriate response
 */
export const recordVisit = async (
  studentId: string,
  tutorId: string,
  visitDate: string = getTodayString()
) => {
  try {
    // Check for existing visit on this date
    const { data: existingVisits, error: checkError } = await supabase
      .from('visits')
      .select('id')
      .eq('student_id', studentId)
      .eq('visit_date', visitDate)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return { success: false, error: checkError.message };
    }

    if (existingVisits) {
      return { duplicate: true, visitId: existingVisits.id };
    }

    // Insert the visit
    const { data: visit, error: insertError } = await supabase
      .from('visits')
      .insert({
        student_id: studentId,
        tutor_id: tutorId,
        visit_date: visitDate,
        visited_at: new Date().toISOString(),
        fee_paid: 0,
        payment_status: 'unpaid',
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // Update or insert monthly summary
    const date = new Date(visitDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // Get the student to fetch their target
    const { data: student } = await supabase
      .from('students')
      .select('monthly_target_visits')
      .eq('id', studentId)
      .single();

    const { error: upsertError } = await supabase
      .from('monthly_summaries')
      .upsert(
        {
          tutor_id: tutorId,
          student_id: studentId,
          year,
          month,
          total_visits: 1, // Will be incremented by count in actual implementation
          target_visits: student?.monthly_target_visits || 0,
        },
        { onConflict: 'student_id,year,month' }
      );

    if (upsertError) {
      console.error('Error upserting monthly summary:', upsertError);
    }

    return { success: true, visit };
  } catch (error) {
    console.error('Error recording visit:', error);
    return { success: false, error: 'Failed to record visit' };
  }
};

/**
 * Get all visits for a student in a given month
 */
export const getVisitsForMonth = async (
  studentId: string,
  year: number,
  month: number
): Promise<string[]> => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');

    const { data: visits, error } = await supabase
      .from('visits')
      .select('visit_date')
      .eq('student_id', studentId)
      .gte('visit_date', startStr)
      .lte('visit_date', endStr)
      .order('visit_date');

    if (error) {
      console.error('Error fetching visits:', error);
      return [];
    }

    return visits?.map((v) => v.visit_date) || [];
  } catch (error) {
    console.error('Error getting visits for month:', error);
    return [];
  }
};

/**
 * Get the count of visits for a student in a given month
 */
export const getVisitCountForMonth = async (
  studentId: string,
  year: number,
  month: number
): Promise<number> => {
  try {
    const visits = await getVisitsForMonth(studentId, year, month);
    return visits.length;
  } catch (error) {
    console.error('Error getting visit count:', error);
    return 0;
  }
};

/**
 * Get all visits for a student with details
 */
export const getVisitDetails = async (
  studentId: string,
  year: number,
  month: number
) => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');

    const { data: visits, error } = await supabase
      .from('visits')
      .select('*')
      .eq('student_id', studentId)
      .gte('visit_date', startStr)
      .lte('visit_date', endStr)
      .order('visit_date', { ascending: false });

    if (error) {
      console.error('Error fetching visit details:', error);
      return [];
    }

    return visits || [];
  } catch (error) {
    console.error('Error getting visit details:', error);
    return [];
  }
};

/**
 * Get the last visit date for a student
 */
export const getLastVisitDate = async (
  studentId: string
): Promise<string | null> => {
  try {
    const { data: visit, error } = await supabase
      .from('visits')
      .select('visit_date')
      .eq('student_id', studentId)
      .order('visit_date', { ascending: false })
      .limit(1)
      .single();

    if (error || !visit) {
      return null;
    }

    return visit.visit_date;
  } catch (error) {
    console.error('Error getting last visit date:', error);
    return null;
  }
};
