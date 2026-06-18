import { Student } from '@/types';
import { supabase } from './supabase';

/**
 * Get all non-archived students for a tutor
 */
export const getStudents = async (tutorId: string): Promise<Student[]> => {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }

    return students || [];
  } catch (error) {
    console.error('Error getting students:', error);
    return [];
  }
};

/**
 * Get all students for a tutor (including archived)
 */
export const getAllStudents = async (tutorId: string): Promise<Student[]> => {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('is_archived', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all students:', error);
      return [];
    }

    return students || [];
  } catch (error) {
    console.error('Error getting all students:', error);
    return [];
  }
};

/**
 * Get a single student by ID
 */
export const getStudent = async (studentId: string): Promise<Student | null> => {
  try {
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (error || !student) {
      console.error('Error fetching student:', error);
      return null;
    }

    return student;
  } catch (error) {
    console.error('Error getting student:', error);
    return null;
  }
};

/**
 * Create a new student
 */
export const createStudent = async (
  tutorId: string,
  student: {
    name: string;
    subject: string;
    monthly_target_visits?: number;
    notes?: string;
    monthly_fee?: number;
    currency?: string;
    email?: string;
  }
) => {
  try {
    const { data: newStudent, error } = await supabase
      .from('students')
      .insert({
        tutor_id: tutorId,
        name: student.name,
        subject: student.subject,
        monthly_target_visits: student.monthly_target_visits || 0,
        notes: student.notes || null,
        is_archived: false,
        monthly_fee: student.monthly_fee || 0,
        currency: student.currency || 'BDT',
        email: student.email?.trim().toLowerCase() || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, student: newStudent };
  } catch (error) {
    console.error('Error creating student:', error);
    return { success: false, error: 'Failed to create student' };
  }
};

/**
 * Update a student
 */
export const updateStudent = async (
  studentId: string,
  updates: Partial<Omit<Student, 'id' | 'created_at' | 'tutor_id'>>
) => {
  try {
    const { data: updatedStudent, error } = await supabase
      .from('students')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.subject && { subject: updates.subject }),
        ...(updates.monthly_target_visits !== undefined && {
          monthly_target_visits: updates.monthly_target_visits,
        }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
        ...(updates.monthly_fee !== undefined && { monthly_fee: updates.monthly_fee }),
        ...(updates.currency && { currency: updates.currency }),
        email: updates.email !== undefined
          ? (updates.email?.trim().toLowerCase() || null)
          : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, student: updatedStudent };
  } catch (error) {
    console.error('Error updating student:', error);
    return { success: false, error: 'Failed to update student' };
  }
};

/**
 * Archive a student
 */
export const archiveStudent = async (studentId: string) => {
  try {
    const { error } = await supabase
      .from('students')
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq('id', studentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error archiving student:', error);
    return { success: false, error: 'Failed to archive student' };
  }
};

/**
 * Delete a student
 */
export const deleteStudent = async (studentId: string) => {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting student:', error);
    return { success: false, error: 'Failed to delete student' };
  }
};
