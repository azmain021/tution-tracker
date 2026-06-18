'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Check if tutor exists, if not create
          const { data: tutor } = await supabase
            .from('tutors')
            .select('id')
            .eq('id', session.user.id)
            .single();

          if (!tutor) {
            await supabase.from('tutors').insert({
              id: session.user.id,
              username: session.user.email?.split('@')[0] || 'tutor',
              full_name: session.user.user_metadata?.full_name || '',
            });
          }

          router.push('/dashboard');
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });

    return () => subscription?.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-transparent border-t-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm mb-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-text-primary">
          TutorTrack
        </h1>
        <p className="text-center text-text-muted text-sm">
          Track your home tuition visits
        </p>
      </div>

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

      <p className="text-center text-text-muted text-xs mt-8">
        Sign up or log in with your email to get started
      </p>
    </div>
  );
}
