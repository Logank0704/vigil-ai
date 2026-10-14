import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  color?: 'accent' | 'success' | 'warning' | 'error';
}

export default function MetricCard({ title, value, icon: Icon, trend, color = 'accent' }: MetricCardProps) {
  const colorClasses = {
    accent: 'border-vigil-accent/30 bg-vigil-accent/5',
    success: 'border-vigil-success/30 bg-vigil-success/5',
    warning: 'border-vigil-warning/30 bg-vigil-warning/5',
    error: 'border-vigil-error/30 bg-vigil-error/5',
  };

  const iconColors = {
    accent: 'text-vigil-accent',
    success: 'text-vigil-success',
    warning: 'text-vigil-warning',
    error: 'text-vigil-error',
  };

  return (
    <div className={`glass rounded-xl p-6 border ${colorClasses[color]} card-shadow hover:card-shadow-hover transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-vigil-text-muted uppercase tracking-wide">{title}</h3>
        {Icon && <Icon className={`w-5 h-5 ${iconColors[color]}`} />}
      </div>
      <div className="text-3xl font-bold text-vigil-text-primary mb-1">{value}</div>
      {trend && (
        <div className="text-xs text-vigil-text-muted mt-2">{trend}</div>
      )}
    </div>
  );
}
