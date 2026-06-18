'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { Check, CheckCircle2 } from 'lucide-react';
import { Student, Visit } from '@/types';
import { recordVisit, getTodayString, getLastVisitDate, getVisitCountForMonth } from '@/lib/visits';
import { VisitConfirmAnimation } from './VisitConfirmAnimation';

interface StudentCardProps {
  student: Student;
  currentMonth: number;
  currentYear: number;
  visitCount: number;
  onVisitRecorded?: () => void;
  onNavigate?: (studentId: string) => void;
  tutorId: string;
}

export default function StudentCard({
  student,
  currentMonth,
  currentYear,
  visitCount,
  onVisitRecorded,
  onNavigate,
  tutorId,
}: StudentCardProps) {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastVisit, setLastVisit] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLastVisit = async () => {
      const date = await getLastVisitDate(student.id);
      setLastVisit(date);
    };
    fetchLastVisit();
  }, [student.id]);

  const handleLongPressStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsLongPressing(true);
      setError(null);

      longPressTimer.current = setTimeout(async () => {
        setLoading(true);
        const result = await recordVisit(student.id, tutorId, getTodayString());

        if (result.duplicate) {
          setError('Already visited today');
          setIsLongPressing(false);
          setLoading(false);
        } else if (result.success) {
          setShowSuccess(true);
          onVisitRecorded?.();
          setTimeout(() => {
            setShowSuccess(false);
            setIsLongPressing(false);
          }, 1500);
        } else {
          setError(result.error || 'Failed to record visit');
          setIsLongPressing(false);
          setLoading(false);
        }
      }, 1000);
    },
    [student.id, tutorId, onVisitRecorded]
  );

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!showSuccess) {
      setIsLongPressing(false);
    }
  }, [showSuccess]);

  const handleTap = () => {
    if (!isLongPressing && !loading) {
      onNavigate?.(student.id);
    }
  };

  const targetVisits = student.monthly_target_visits || 20;
  const progressPercent = Math.min((visitCount / targetVisits) * 100, 100);
  const lastVisitFormatted = lastVisit
    ? format(new Date(lastVisit), 'MMM dd')
    : 'Never';

  return (
    <div
      ref={cardRef}
      className={`relative bg-bg-card border border-border rounded-2xl p-5 mb-4 transition-all ${
        isLongPressing ? 'ring-2 ring-accent shadow-lg' : ''
      } cursor-pointer select-none`}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
      onContextMenu={(e) => e.preventDefault()}
      onClick={handleTap}
    >
      {/* Long-press ring animation */}
      {isLongPressing && !showSuccess && (
        <div className="absolute inset-0 rounded-2xl border-2 border-accent ring-2 ring-accent/50 animate-pulse" />
      )}

      {/* Success animation overlay */}
      {showSuccess && <VisitConfirmAnimation />}

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 rounded-2xl bg-bg-card/80 flex items-center justify-center z-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-transparent border-t-accent" />
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="absolute -top-12 left-0 right-0 mx-auto bg-red-900/80 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap">
          {error}
        </div>
      )}

      {/* Card content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-text-primary mb-1">
            {student.name}
          </h3>
          <p className="text-sm text-text-muted">{student.subject}</p>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-2xl font-bold text-accent">
              {visitCount}{' '}
              <span className="text-lg text-text-muted">/ {targetVisits}</span>
            </p>
            <p className="text-xs text-text-muted mt-1">visits</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Last visit</p>
            <p className="text-sm font-medium text-text-primary">
              {lastVisitFormatted}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-bg-card-hover rounded-full h-2 overflow-hidden border border-border">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Long-press hint */}
        <p className="text-xs text-text-muted mt-3 text-center">
          {isLongPressing ? 'Hold to confirm...' : 'Long-press to record visit'}
        </p>
      </div>
    </div>
  );
}
