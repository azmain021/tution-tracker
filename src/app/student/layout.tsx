'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import '@/styles/globals.css';

export default function StudentLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/student-login');
        return;
      }
      setEmail(session.user.email || '');
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/student-login');
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 border border-accent/20">
            <GraduationCap size={18} className="text-accent" />
          </div>
          <div>
            <span className="font-bold text-text-primary text-sm">Student Portal</span>
            {email && (
              <p className="text-xs text-text-muted">{email}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm px-3 py-2 rounded-lg hover:bg-bg-card-hover"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </header>

      {/* Page content */}
      <main>{children}</main>
    </div>
  );
}
