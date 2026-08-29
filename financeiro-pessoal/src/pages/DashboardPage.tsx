import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ShieldCheck, TrendingUp, Landmark, Plus, CalendarRange, Calculator } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useAchievementSync } from '@/hooks/useAchievementSync';
import { StatCard } from '@/components/ui/Card';
import { HouseGoalCard } from '@/components/dashboard/HouseGoalCard';
import { MilestonesTrail } from '@/components/dashboard/MilestonesTrail';
import { IncomeGoalCard } from '@/components/dashboard/IncomeGoalCard';
import { FinancialInsights } from '@/components/dashboard/FinancialInsights';
import { AchievementsGrid } from '@/components/gamification/AchievementsGrid';
import { formatCurrency } from '@/lib/format';
import { buildInsights } from '@/lib/insights';
import {
  netWorth, reserveTotal, availableCash, monthlyIncome,
  currentMonthISO, calcHouseProjection, buildMilestones,
} from '@/lib/financeCalculations';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    loading, error, accounts, assets, liabilities,
    transactions, categories, goals, settings, installments, achievements, refresh,
  } = useFinanceData();

  const firstName = useMemo(() => {
    const meta = user?.user_metadata as { full_name?: string } | undefined;
    return meta?.full_name?.split(' ')[0] || 'Gabriel';
  }, [user]);

  const worth = useMemo(() => netWorth(accounts, assets, liabilities), [accounts, assets, liabilities]);
  const reserve = useMemo(() => reserveTotal(accounts), [accounts]);
  const available = useMemo(() => availableCash(accounts), [accounts]);
  const monthIncome = useMemo(() => monthlyIncome(transactions, currentMonthISO()), [transactions]);

  const incomeGoal = settings?.monthly_income_goal ?? 10000;
  const houseTarget = settings?.house_goal_value ?? 50000;
  const houseTotalMonths = settings?.house_goal_months ?? 12;

  const houseGoal = goals.find((g) => g.goal_type === 'house');
  const houseCurrent = houseGoal?.current_value ?? 0;
  const houseMonthsElapsed = useMemo(() => {
    if (!houseGoal) return 1;
    const created = new Date(houseGoal.created_at);
    const now = new Date();
    const months = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
    return Math.max(1, months);
  }, [houseGoal]);

  const projection = useMemo(
    () => calcHouseProjection(houseCurrent, houseTarget, houseTotalMonths, houseMonthsElapsed),
    [houseCurrent, houseTarget, houseTotalMonths, houseMonthsElapsed],
  );

  const milestones = useMemo(() => buildMilestones(houseCurrent, houseTarget), [houseCurrent, houseTarget]);

  const incomeBreakdown = useMemo(() => {
    const monthTx = transactions.filter((t) => t.type === 'income' && t.date.startsWith(currentMonthISO()));
    const byCategory = new Map<string, number>();
    for (const t of monthTx) {
      const cat = categories.find((c) => c.id === t.category_id);
      const label = cat?.name ?? 'Outros';
      byCategory.set(label, (byCategory.get(label) ?? 0) + Number(t.amount));
    }
    const colors = ['#34d399', '#22d3ee', '#a78bfa', '#f472b6', '#fbbf24'];
    return Array.from(byCategory.entries()).map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }));
  }, [transactions, categories]);

  const insights = useMemo(
    () => buildInsights(transactions, categories, installments, goals, incomeGoal, houseTarget, houseTotalMonths),
    [transactions, categories, installments, goals, incomeGoal, houseTarget, houseTotalMonths],
  );

  useAchievementSync(goals, transactions, achievements, refresh);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-900/60 animate-pulse" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-rose-950/40 border border-rose-900 text-rose-400 px-4 py-3">
        Não foi possível carregar seus dados: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Olá, {firstName} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Aqui está o seu painel de comando financeiro.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to="/movimentacoes" className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 rounded-full px-3 py-1.5 hover:border-emerald-700 hover:text-emerald-400 transition-colors">
          <Plus size={14} /> Adicionar movimentação
        </Link>
        <Link to="/plano-12-meses" className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 rounded-full px-3 py-1.5 hover:border-emerald-700 hover:text-emerald-400 transition-colors">
          <CalendarRange size={14} /> Ver plano
        </Link>
        <Link to="/simulador" className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 rounded-full px-3 py-1.5 hover:border-emerald-700 hover:text-emerald-400 transition-colors">
          <Calculator size={14} /> Simular renda
        </Link>
        <Link to="/patrimonio" className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 rounded-full px-3 py-1.5 hover:border-emerald-700 hover:text-emerald-400 transition-colors">
          <Landmark size={14} /> Ver patrimônio
        </Link>
      </div>

      <HouseGoalCard projection={projection} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Landmark size={16} />} label="Patrimônio líquido" value={formatCurrency(worth)} accent="from-emerald-400 to-cyan-500" />
        <StatCard icon={<Wallet size={16} />} label="Dinheiro disponível" value={formatCurrency(available)} accent="from-cyan-400 to-blue-500" />
        <StatCard icon={<TrendingUp size={16} />} label="Renda do mês" value={formatCurrency(monthIncome)} subValue={`Meta: ${formatCurrency(incomeGoal)}`} accent="from-violet-400 to-fuchsia-500" />
        <StatCard icon={<ShieldCheck size={16} />} label="Reserva de emergência" value={formatCurrency(reserve)} accent="from-amber-400 to-orange-500" />
      </div>

      <FinancialInsights insights={insights} />

      <div className="grid md:grid-cols-2 gap-6">
        <MilestonesTrail milestones={milestones} />
        <IncomeGoalCard current={monthIncome} target={incomeGoal} breakdown={incomeBreakdown} />
      </div>

      <AchievementsGrid achievements={achievements} />
    </div>
  );
}
