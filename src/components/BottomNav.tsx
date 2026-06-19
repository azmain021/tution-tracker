'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, BarChart3, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/students', icon: Users, label: 'Students' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname.startsWith(path);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* ── Mobile: fixed bottom bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-bg-card border-t border-border flex justify-around items-center h-20 z-40">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive(href)
                ? 'text-accent'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Icon size={24} />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-full h-full transition-colors text-text-muted hover:text-red-500"
        >
          <LogOut size={24} />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </nav>

      {/* ── Desktop: fixed left sidebar ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-bg-card border-r border-border flex-col z-40">
        {/* Brand */}
        <div className="px-6 py-7 border-b border-border">
          <p className="text-2xl font-bold text-text-primary tracking-tight">TutorTrack</p>
          <p className="text-xs text-text-muted mt-1">Home tuition tracker</p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col flex-1 p-4 gap-1 mt-2">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive(href)
                  ? 'bg-accent/15 text-accent'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-card-hover'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer with Logout */}
        <div className="px-4 py-5 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all text-text-muted hover:text-red-500 hover:bg-bg-card-hover mb-2"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
          <p className="text-xs text-text-muted px-4">© 2025 TutorTrack</p>
        </div>
      </aside>
    </>
  );
}
