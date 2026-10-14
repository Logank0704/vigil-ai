'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FlaskConical, Shield, Bot, FileText } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Playground', path: '/playground', icon: FlaskConical },
  { name: 'Policy Manager', path: '/policies', icon: Shield },
  { name: 'Agents Panel', path: '/agents', icon: Bot },
  { name: 'Audit Logs', path: '/logs', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-vigil-navy border-r border-vigil-border flex flex-col">
      <div className="p-6 border-b border-vigil-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-vigil-accent rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-vigil-text-primary tracking-tight">
              VIGIL AI
            </h1>
            <p className="text-xs text-vigil-text-muted font-medium tracking-wider uppercase">
              Enterprise Defense
            </p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group ${
                isActive
                  ? 'bg-vigil-accent/10 text-vigil-accent border border-vigil-accent/20'
                  : 'text-vigil-text-secondary hover:bg-slate-800/50 hover:text-vigil-text-primary'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-vigil-accent' : 'text-vigil-text-muted group-hover:text-vigil-text-primary'}`} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-vigil-border">
        <div className="text-xs text-vigil-text-muted space-y-1">
          <div className="font-medium">Version 1.0.0</div>
          <div>© 2024 Vigil AI</div>
        </div>
      </div>
    </div>
  );
}
