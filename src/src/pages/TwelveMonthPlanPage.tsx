import { useMemo, useState } from 'react';
import { CalendarRange } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/format';
import * as svc from '@/services/financeService';
import { monthlyIncome, monthlyExpenses } from '@/lib/financeCalculations';

function monthLabel(iso: string): string {
  return new Date(`${iso}-01T00:00:00`).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

function buildPlanMonths(totalMonths: number, houseCreatedAt?: string): string[] {
  const start = houseCreatedAt ? new Date(houseCreatedAt) : new Date();
  const months: string[] = [];
  for (let i = 0; i < totalMonths; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

export default function TwelveMonthPlanPage() {
  const { user } = useAuth();
  const { loading, transactions, installments, goals, settings, monthlyPlan, refresh } = useFinanceData();
  const [savingMonth, setSavingMonth] = useState<string | null>(null);

  const houseGoal = goals.find((g) => g.goal_type === 'house');
  const totalMonths = settings?.house_goal_months ?? 12;
  const houseTarget = settings?.house_goal_value ?? houseGoal?.target_value ?? 50000;

  const months = useMemo(
    () => buildPlanMonths(totalMonths, houseGoal?.created_at),
    [totalMonths, houseGoal],
  );

  const defaultMonthlyPlan = houseTarget / totalMonths;

  const rows = useMemo(() => {
    let cumulativeActual = 0;
    let cumulativePlanned = 0;

    return months.map((m, idx) => {
      const income = monthlyIncome(transactions, m);
      const expenses = monthlyExpenses(transactions, m);
      const installmentsForMonth = installments.reduce((sum, inst) => {
        const remaining = Math.max(0, inst.total_installments - inst.current_installment + 1);
        const [y, mm, d] = inst.first_due_date.split('-').map(Number);
        for (let i = 0; i < remaining; i++) {
          const date = new Date(y, mm - 1 + (inst.current_installment - 1) + i, d);
          if (date.toISOString().slice(0, 7) === m) return sum + inst.installment_amount;
        }
        return sum;
      }, 0);

      const planEntry = monthlyPlan.find((p) => p.month === m);
      const planned = planEntry?.planned_savings ?? defaultMonthlyPlan;
      const actual = Math.max(0, income - expenses - installmentsForMonth);

      cumulativePlanned += planned;
      cumulativeActual += actual;

      const diff = cumulativeActual - cumulativePlanned;
      const pctOfPlan = cumulativePlanned > 0 ? (cumulativeActual / cumulativePlanned) * 100 : 0;

      let status: 'ok' | 'warn' | 'bad' = 'ok';
      if (pctOfPlan < 80) status = 'bad';
      else if (pctOfPlan < 100) status = 'warn';

      return {
        month: m, idx, income, expenses, installmentsForMonth,
        planned, actual, cumulativePlanned, cumulativeActual, diff, status,
      };
    });
  }, [months, transactions, installments, monthlyPlan, defaultMonthlyPlan]);

  async function handlePlanChange(month: string, value: string) {
    if (!user) return;
    const num = Number(value.replace(',', '.'));
    if (Number.isNaN(num)) return;
    setSavingMonth(month);
    try {
      await svc.upsertMonthlyPlan(user.id, month, num);
      await refresh();
    } finally {
      setSavingMonth(null);
    }
  }

  if (loading) return <div className="h-40 rounded-2xl bg-slate-900/60 animate-pulse" />;

  const STATUS_STYLE: Record<string, string> = {
    ok: 'bg-emerald-950/50 text-emerald-400 border-emerald-900',
    warn: 'bg-amber-950/50 text-amber-400 border-amber-900',
    bad: 'bg-rose-950/50 text-rose-400 border-rose-900',
  };
  const STATUS_LABEL: Record<string, string> = { ok: '🟢 No ritmo', warn: '🟡 Atenção', bad: '🔴 Abaixo do ritmo' };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-6">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
          <CalendarRange size={18} className="text-slate-950" />
        </div>
        <h1 className="text-2xl font-bold text-white">Plano Casa — {totalMonths} meses</h1>
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <Card key={r.month}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold capitalize">{monthLabel(r.month)}</span>
              <span className={`text-xs font-medium border rounded-full px-2.5 py-1 ${STATUS_STYLE[r.status]}`}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="bg-slate-800/60 rounded-lg p-2">
                <p className="text-slate-500 text-[10px]">Renda</p>
                <p className="text-white text-sm font-semibold">{formatCurrency(r.income)}</p>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-2">
                <p className="text-slate-500 text-[10px]">Despesas</p>
                <p className="text-white text-sm font-semibold">{formatCurrency(r.expenses)}</p>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-2">
                <p className="text-slate-500 text-[10px]">Parcelas</p>
                <p className="text-white text-sm font-semibold">{formatCurrency(r.installmentsForMonth)}</p>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-2">
                <p className="text-slate-500 text-[10px]">Guardado</p>
                <p className="text-white text-sm font-semibold">{formatCurrency(r.actual)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Planejado guardar (R$)</label>
                <input
                  defaultValue={r.planned.toFixed(0)}
                  onBlur={(e) => handlePlanChange(r.month, e.target.value)}
                  inputMode="decimal"
                  disabled={savingMonth === r.month}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                />
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Acumulado vs plano</p>
                <p className={`text-sm font-semibold ${r.diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {r.diff >= 0 ? '+' : ''}{formatCurrency(r.diff)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
