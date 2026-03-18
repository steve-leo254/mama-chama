// src/components/ui/Badge.tsx
interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

export default function Badge({ variant, children, size = 'sm' }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-primary-50 text-primary-700 border-primary-200',
    neutral: 'bg-gray-50 text-gray-700 border-gray-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}