interface BadgeProps {
  children: React.ReactNode;
  variant?: 'low' | 'medium' | 'high' | 'critical' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export default function Badge({ children, variant = 'low', size = 'sm' }: BadgeProps) {
  const variantClasses = {
    low: 'bg-vigil-accent/10 text-vigil-accent border-vigil-accent/20',
    medium: 'bg-vigil-warning/10 text-vigil-warning border-vigil-warning/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    critical: 'bg-vigil-error/10 text-vigil-error border-vigil-error/20',
    success: 'bg-vigil-success/10 text-vigil-success border-vigil-success/20',
    warning: 'bg-vigil-warning/10 text-vigil-warning border-vigil-warning/20',
    error: 'bg-vigil-error/10 text-vigil-error border-vigil-error/20',
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
}
