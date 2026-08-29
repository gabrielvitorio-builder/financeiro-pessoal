import { TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/lib/format';

interface IncomeBreakdown {
  label: string;
  value: number;
  color: string;
}

export function IncomeGoalCard({
  current,
  target,
  breakdown,
}: {
  current: number;
  target: number;
  breakdown: IncomeBreakdown[];
}) {
  const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center">
          <TrendingUp size={18} className="text-slate-950" />
        </div>
        <h3 className="text-white font-bold">Meta de renda</h3>
      </div>

      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-extrabold text-white">{formatCurrency(current)}</span>
        <span className="text-slate-400 text-sm mb-1">meta {formatCurrency(target)}</span>
      </div>

      <ProgressBar percent={percent} gradient="from-violet-400 to-fuchsia-500" />

      <div className="mt-4 space-y-2">
        {breakdown.map((b) => (
          <div key={b.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
              {b.label}
            </div>
            <span className="text-white font-medium">{formatCurrency(b.value)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
