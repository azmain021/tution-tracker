'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { GraduationCap } from 'lucide-react';

export default function StudentLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          await linkAndRedirect(session.user.id, session.user.email!);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsLoading(true);
        await linkAndRedirect(session.user.id, session.user.email!);
        setIsLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const linkAndRedirect = async (userId: string, email: string) => {
    try {
      // Find a student record matching this email
      const { data: studentRecords, error } = await supabase
        .from('students')
        .select('id, student_user_id')
        .eq('email', email.toLowerCase().trim());

      if (error) throw error;

      if (!studentRecords || studentRecords.length === 0) {
        // No student record found — sign them out and show error
        await supabase.auth.signOut();
        setLinkError(
          `No student record found for "${email}". Please ask your tutor to add your email to your student profile first.`
        );
        setIsLoading(false);
        return;
      }

      // Link any unlinked records to this user
      for (const record of studentRecords) {
        if (!record.student_user_id) {
          await supabase
            .from('students')
            .update({ student_user_id: userId })
            .eq('id', record.id);
        }
      }

      router.push('/student/attendance');
    } catch (err) {
      console.error('Error linking student:', err);
      setLinkError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-transparent border-t-accent" />
          <p className="text-text-muted text-sm">Connecting your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
      {/* Brand */}
      <div className="w-full max-w-sm mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
          <GraduationCap size={32} className="text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Student Portal</h1>
        <p className="text-text-muted text-sm mt-2">
          Check your attendance &amp; progress
        </p>
      </div>

      {/* Error banner */}
      {linkError && (
        <div className="w-full max-w-sm mb-4 bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-xl text-sm">
          {linkError}
        </div>
      )}

      {/* Auth form */}
      <div className="w-full max-w-sm bg-bg-card rounded-2xl p-8 border border-border">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#F59E0B',
                  brandAccent: '#FBBF24',
                  brandButtonText: '#0A0A0A',
                  defaultButtonBackground: '#1C1C1E',
                  defaultButtonBackgroundHover: '#2C2C2E',
                  defaultButtonBorder: '#3A3A3C',
                  defaultButtonText: '#F5F5F5',
                  dividerBackground: '#3A3A3C',
                  inputBackground: '#2C2C2E',
                  inputBorder: '#3A3A3C',
                  inputBorderFocus: '#F59E0B',
                  inputBorderHover: '#3A3A3C',
                  inputLabelText: '#F5F5F5',
                  inputPlaceholder: '#8E8E93',
                  inputText: '#F5F5F5',
                  messageText: '#F5F5F5',
                  messageTextDanger: '#EF4444',
                  anchorTextColor: '#F59E0B',
                  anchorTextHoverColor: '#FBBF24',
                },
              },
            },
            className: {
              container: 'w-full',
              button: 'min-h-[48px] rounded-lg font-medium',
              input: 'rounded-lg min-h-[48px]',
            },
          }}
          providers={[]}
        />
      </div>

      <p className="text-center text-text-muted text-xs mt-6 max-w-sm">
        Sign in with the email your tutor registered for you. If you don&apos;t have
        an account yet, use Sign Up with the same email.
      </p>

      {/* Link back to tutor portal */}
      <a
        href="/login"
        className="mt-6 text-xs text-text-muted hover:text-accent transition-colors"
      >
        Are you a tutor? → Tutor Login
      </a>
    </div>
  );
}
