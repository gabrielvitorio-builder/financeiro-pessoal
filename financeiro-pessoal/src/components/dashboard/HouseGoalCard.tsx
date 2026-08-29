import { Home } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/lib/format';
import type { HouseProjection } from '@/lib/financeCalculations';

export function HouseGoalCard({ projection }: { projection: HouseProjection }) {
  const {
    current, target, percent, remaining, recommendedMonthly,
    monthsRemaining, paceDiffPercent, projectedCompletionMonths,
  } = projection;

  const isAhead = paceDiffPercent >= 0;

  return (
    <Card className="relative overflow-hidden border-emerald-900/50">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 opacity-10 blur-2xl" />
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
          <Home size={20} className="text-slate-950" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">Projeto Casa</h3>
          <p className="text-slate-500 text-xs">Sua meta principal</p>
        </div>
      </div>

      <div className="flex items-end justify-between mb-2">
        <span className="text-3xl font-extrabold text-white">{formatCurrency(current)}</span>
        <span className="text-slate-400 text-sm mb-1">de {formatCurrency(target)}</span>
      </div>

      <ProgressBar percent={percent} height="h-3.5" />
      <div className="flex justify-between text-xs text-slate-500 mt-2 mb-5">
        <span>{percent.toFixed(1)}% concluído</span>
        <span>Faltam {formatCurrency(remaining)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/60 rounded-xl p-3">
          <p className="text-slate-500 text-xs mb-0.5">Meta mensal</p>
          <p className="text-white font-semibold text-sm">{formatCurrency(recommendedMonthly)}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3">
          <p className="text-slate-500 text-xs mb-0.5">Meses restantes</p>
          <p className="text-white font-semibold text-sm">{monthsRemaining} meses</p>
        </div>
      </div>

      <div
        className={`rounded-xl px-4 py-3 text-sm font-medium ${
          isAhead
            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900'
            : 'bg-amber-950/50 text-amber-400 border border-amber-900'
        }`}
      >
        {isAhead
          ? `Você está ${Math.abs(paceDiffPercent).toFixed(0)}% à frente do plano. 🎉`
          : `Você está ${Math.abs(paceDiffPercent).toFixed(0)}% abaixo do ritmo.`}
        {projectedCompletionMonths !== null && (
          <span className="block text-xs font-normal mt-1 opacity-80">
            No ritmo atual, você atinge a meta em aproximadamente {projectedCompletionMonths} meses.
          </span>
        )}
      </div>
    </Card>
  );
}
