import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { inputClass } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/format';
import { useFinanceData } from '@/hooks/useFinanceData';

export default function SimulatorPage() {
  const { goals, settings } = useFinanceData();
  const houseGoal = goals.find((g) => g.goal_type === 'house');

  const [income, setIncome] = useState('10000');
  const [savePercent, setSavePercent] = useState('50');
  const [target, setTarget] = useState(String(settings?.house_goal_value ?? houseGoal?.target_value ?? 50000));
  const [current, setCurrent] = useState(String(houseGoal?.current_value ?? 0));

  const planMonths = settings?.house_goal_months ?? 12;

  const result = useMemo(() => {
    const incomeNum = Number(income.replace(',', '.')) || 0;
    const pct = Number(savePercent.replace(',', '.')) || 0;
    const targetNum = Number(target.replace(',', '.')) || 0;
    const currentNum = Number(current.replace(',', '.')) || 0;

    const monthlySavings = incomeNum * (pct / 100);
    const remaining = Math.max(0, targetNum - currentNum);
    const monthsNeeded = monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : null;

    const estimatedDate = monthsNeeded
      ? new Date(new Date().setMonth(new Date().getMonth() + monthsNeeded))
      : null;

    const diffToPlan = monthsNeeded !== null ? monthsNeeded - planMonths : null;

    const chartData: Array<{ month: number; Acumulado: number }> = [];
    if (monthlySavings > 0) {
      const steps = Math.min(monthsNeeded ?? 0, 36);
      for (let i = 0; i <= steps; i++) {
        chartData.push({ month: i, Acumulado: Math.min(targetNum, currentNum + monthlySavings * i) });
      }
    }

    return { monthlySavings, monthsNeeded, estimatedDate, diffToPlan, chartData, remaining };
  }, [income, savePercent, target, current, planMonths]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-6">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
          <Calculator size={18} className="text-slate-950" />
        </div>
        <h1 className="text-2xl font-bold text-white">Se eu ganhar R$ X…</h1>
      </div>

      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Renda mensal (R$)</label>
            <input value={income} onChange={(e) => setIncome(e.target.value)} inputMode="decimal" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">% que consigo guardar</label>
            <input value={savePercent} onChange={(e) => setSavePercent(e.target.value)} inputMode="decimal" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Valor atual já guardado (R$)</label>
            <input value={current} onChange={(e) => setCurrent(e.target.value)} inputMode="decimal" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Objetivo (R$)</label>
            <input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="decimal" className={inputClass} />
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-950/60 to-cyan-950/40 border-emerald-900">
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div>
            <p className="text-slate-400 text-xs mb-1">Economia mensal</p>
            <p className="text-white font-bold text-xl">{formatCurrency(result.monthlySavings)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Tempo estimado</p>
            <p className="text-white font-bold text-xl">
              {result.monthsNeeded !== null ? `${result.monthsNeeded} meses` : '—'}
            </p>
          </div>
        </div>
        {result.estimatedDate && (
          <p className="text-center text-sm text-slate-300 mb-2">
            Data estimada: {result.estimatedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        )}
        {result.diffToPlan !== null && (
          <p className={`text-center text-sm font-medium ${result.diffToPlan <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {result.diffToPlan <= 0
              ? `${Math.abs(result.diffToPlan)} meses mais rápido que o plano de ${planMonths} meses.`
              : `${result.diffToPlan} meses a mais que o plano de ${planMonths} meses.`}
          </p>
        )}
      </Card>

      {result.chartData.length > 1 && (
        <Card>
          <h3 className="text-white font-semibold mb-4">Evolução projetada</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={result.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} label={{ value: 'meses', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => formatCurrency(v)} width={90} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }} />
              <Line type="monotone" dataKey="Acumulado" stroke="#34d399" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
