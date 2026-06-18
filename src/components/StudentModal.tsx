'use client';

import { useState } from 'react';
import { X, Link2, Unlink } from 'lucide-react';
import { Student } from '@/types';
import { createStudent, updateStudent } from '@/lib/students';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  tutorId: string;
  student?: Student;
}

export function StudentModal({
  isOpen,
  onClose,
  onSave,
  tutorId,
  student,
}: StudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: student?.name || '',
    subject: student?.subject || '',
    monthly_target_visits: student?.monthly_target_visits || 0,
    notes: student?.notes || '',
    monthly_fee: student?.monthly_fee || 0,
    currency: student?.currency || 'BDT',
    email: student?.email || '',
  });

  const isConnected = !!student?.student_user_id;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('fee') || name.includes('visits')
        ? parseInt(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.name.trim() || !formData.subject.trim()) {
        setError('Name and subject are required');
        setLoading(false);
        return;
      }

      if (student?.id) {
        const result = await updateStudent(student.id, formData);
        if (!result.success) {
          setError(result.error || 'Failed to update student');
          setLoading(false);
          return;
        }
      } else {
        const result = await createStudent(tutorId, formData);
        if (!result.success) {
          setError(result.error || 'Failed to create student');
          setLoading(false);
          return;
        }
      }

      onSave();
      onClose();
    } catch (err) {
      setError('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end lg:items-center justify-center z-50">
      <div className="w-full lg:w-[520px] bg-bg-card rounded-t-2xl lg:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {student ? 'Edit Student' : 'Add Student'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Student name"
              className="w-full bg-bg-card-hover border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="E.g., Mathematics"
              className="w-full bg-bg-card-hover border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Student Portal Email — linking field */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Student Portal Email
              <span className="ml-2 text-xs text-text-muted font-normal">
                (student logs in with this)
              </span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className="w-full bg-bg-card-hover border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {/* Connection status badge (edit mode only) */}
            {student && (
              <div className={`flex items-center gap-2 mt-2 text-xs px-3 py-1.5 rounded-lg w-fit ${
                isConnected
                  ? 'bg-green-900/20 text-green-400 border border-green-900/40'
                  : 'bg-yellow-900/20 text-yellow-500 border border-yellow-900/40'
              }`}>
                {isConnected
                  ? <><Link2 size={12} /> Connected — student has logged in</>
                  : <><Unlink size={12} /> Not connected yet — student hasn&apos;t signed in</>
                }
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Monthly Target Visits
            </label>
            <input
              type="number"
              name="monthly_target_visits"
              value={formData.monthly_target_visits}
              onChange={handleChange}
              placeholder="20"
              className="w-full bg-bg-card-hover border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Monthly Fee
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="monthly_fee"
                value={formData.monthly_fee}
                onChange={handleChange}
                placeholder="0"
                className="flex-1 bg-bg-card-hover border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="bg-bg-card-hover border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="BDT">BDT</option>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full bg-bg-card-hover border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-bg-card-hover border border-border text-text-primary rounded-lg py-3 font-medium transition-colors hover:bg-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-accent text-bg-primary rounded-lg py-3 font-medium transition-colors hover:bg-yellow-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
