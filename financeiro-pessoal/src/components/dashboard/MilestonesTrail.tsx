import { Card } from '@/components/ui/Card';
import type { Milestone } from '@/lib/financeCalculations';
import { formatCurrency } from '@/lib/format';

export function MilestonesTrail({ milestones }: { milestones: Milestone[] }) {
  return (
    <Card>
      <h3 className="text-white font-bold mb-4">Seu caminho para a casa</h3>
      <div className="flex flex-col gap-3">
        {milestones.map((m) => (
          <div
            key={m.value}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors ${
              m.reached
                ? 'bg-emerald-950/40 border-emerald-900'
                : 'bg-slate-800/40 border-slate-800'
            }`}
          >
            <span className={`text-2xl ${m.reached ? '' : 'grayscale opacity-40'}`}>{m.emoji}</span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${m.reached ? 'text-white' : 'text-slate-500'}`}>
                {m.label}
              </p>
              <p className="text-xs text-slate-500">{formatCurrency(m.value)}</p>
            </div>
            {m.reached && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-900/40 rounded-full px-2 py-0.5">
                Conquistado
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
