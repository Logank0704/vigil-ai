'use client';

import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Search, LogOut } from 'lucide-react';

export default function Header() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="h-16 bg-vigil-navy/95 backdrop-blur-sm border-b border-vigil-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-vigil-text-muted" />
          <input
            type="search"
            placeholder="Search events, policies, agents..."
            className="bg-slate-800/50 border border-vigil-border rounded-lg pl-10 pr-4 py-2 text-sm text-vigil-text-primary placeholder-vigil-text-muted focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 w-80 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="text-right">
              <div className="text-sm font-medium text-vigil-text-primary">{user.name}</div>
              <div className="text-xs text-vigil-text-muted uppercase tracking-wide">{user.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-vigil-border rounded-lg text-sm text-vigil-text-secondary hover:text-vigil-text-primary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
