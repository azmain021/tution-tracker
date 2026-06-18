'use client';

import { CheckCircle2 } from 'lucide-react';

export function VisitConfirmAnimation() {
  return (
    <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-success/10 z-20">
      <div className="animate-scale-in">
        <CheckCircle2 size={48} className="text-success" />
      </div>
    </div>
  );
}
