// src/components/ui/ProgressBar.tsx
interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'primary' | 'emerald' | 'amber' | 'rose';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function ProgressBar({ value, max, color = 'primary', showLabel = true, size = 'md' }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    primary: 'bg-primary-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  const bgColors = {
    primary: 'bg-primary-100',
    emerald: 'bg-emerald-100',
    amber: 'bg-amber-100',
    rose: 'bg-rose-100',
  };

  const heights = { sm: 'h-1.5', md: 'h-2.5' };

  return (
    <div className="w-full">
      <div className={`w-full ${bgColors[color]} rounded-full ${heights[size]} overflow-hidden`}>
        <div
          className={`${colors[color]} ${heights[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}% complete</p>
      )}
    </div>
  );
}