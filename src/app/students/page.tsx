'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Plus, Archive } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getAllStudents, archiveStudent, deleteStudent } from '@/lib/students';
import { Student } from '@/types';
import { StudentModal } from '@/components/StudentModal';
import BottomNav from '@/components/BottomNav';

export default function StudentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [archivedStudents, setArchivedStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const [showArchived, setShowArchived] = useState(false);

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
      await fetchStudents(session.user.id);
    };

    checkAuth();
  }, [router]);

  const fetchStudents = async (tutorId: string) => {
    try {
      const allStudents = await getAllStudents(tutorId);
      const active = allStudents.filter((s) => !s.is_archived);
      const archived = allStudents.filter((s) => s.is_archived);
      setStudents(active);
      setArchivedStudents(archived);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student?: Student) => {
    setEditingStudent(student);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingStudent(undefined);
  };

  const handleSaveStudent = async () => {
    if (user) {
      await fetchStudents(user.id);
    }
  };

  const handleArchive = async (studentId: string) => {
    if (confirm('Archive this student?')) {
      const result = await archiveStudent(studentId);
      if (result.success && user) {
        await fetchStudents(user.id);
      }
    }
  };

  const handleDelete = async (studentId: string) => {
    if (confirm('Delete this student? This cannot be undone.')) {
      const result = await deleteStudent(studentId);
      if (result.success && user) {
        await fetchStudents(user.id);
      } else if (!result.success) {
        alert('Error: ' + result.error);
        console.error('Delete error:', result.error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-transparent border-t-accent" />
      </div>
    );
  }

  return (
    <div className="bg-bg-primary min-h-screen pb-28 lg:pb-10">
      <div className="p-6 max-w-[430px] mx-auto lg:ml-64 lg:max-w-none lg:p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Students</h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-accent text-bg-primary rounded-lg p-3 font-medium transition-colors hover:bg-yellow-500 flex items-center gap-2"
          >
            <Plus size={20} />
            Add
          </button>
        </div>

        {/* Active Students */}
        {students.length === 0 ? (
          <div className="bg-bg-card border border-border rounded-2xl p-8 text-center mb-6">
            <p className="text-text-muted">No students yet</p>
          </div>
        ) : (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Active</h2>
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="bg-bg-card border border-border rounded-lg p-4 flex justify-between items-start"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => router.push(`/students/${student.id}`)}
                  >
                    <h3 className="font-medium text-text-primary">{student.name}</h3>
                    <p className="text-sm text-text-muted">{student.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(student)}
                      className="text-accent hover:text-yellow-500 transition-colors p-2"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleArchive(student.id)}
                      className="text-text-muted hover:text-text-primary transition-colors p-2"
                      title="Archive student"
                    >
                      <Archive size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Archived Students */}
        {archivedStudents.length > 0 && (
          <div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="text-sm text-text-muted hover:text-text-primary transition-colors mb-4 w-full text-center py-2"
            >
              {showArchived ? '▼' : '▶'} Archived ({archivedStudents.length})
            </button>

            {showArchived && (
              <div className="space-y-3">
                {archivedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-bg-card border border-border rounded-lg p-4 flex justify-between items-start opacity-60"
                  >
                    <div>
                      <h3 className="font-medium text-text-primary">{student.name}</h3>
                      <p className="text-sm text-text-muted">{student.subject}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-text-muted hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <StudentModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveStudent}
        tutorId={user?.id || ''}
        student={editingStudent}
      />

      <BottomNav />
    </div>
  );
}
