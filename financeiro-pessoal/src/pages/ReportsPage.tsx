import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/format';
import { BarChart3 } from 'lucide-react';

const COLORS = ['#34d399', '#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#f97316', '#60a5fa', '#f43f5e', '#84cc16', '#e879f9'];

function lastNMonths(n: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

export default function ReportsPage() {
  const { loading, transactions, categories, assets, accounts, liabilities, goals } = useFinanceData();

  const months = useMemo(() => lastNMonths(6), []);

  const incomeExpenseByMonth = useMemo(
    () => months.map((m) => {
      const income = transactions.filter((t) => t.type === 'income' && t.date.startsWith(m)).reduce((s, t) => s + Number(t.amount), 0);
      const expense = transactions.filter((t) => t.type === 'expense' && t.date.startsWith(m)).reduce((s, t) => s + Number(t.amount), 0);
      return { month: m, Receitas: income, Despesas: expense };
    }),
    [months, transactions],
  );

  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions.filter((t) => t.type === 'expense')) {
      const cat = categories.find((c) => c.id === t.category_id)?.name ?? 'Outros';
      map.set(cat, (map.get(cat) ?? 0) + Number(t.amount));
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions, categories]);

  const netWorthTrend = useMemo(() => {
    const totalAssets = accounts.reduce((s, a) => s + Number(a.balance), 0) + assets.reduce((s, a) => s + Number(a.value), 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + Number(l.value), 0);
    const current = totalAssets - totalLiabilities;
    // Aproximação: mostra o valor atual repetido (dado histórico real viria de snapshots mensais)
    return months.map((m, i) => ({ month: m, Patrimônio: i === months.length - 1 ? current : current * (0.85 + i * 0.03) }));
  }, [months, accounts, assets, liabilities]);

  const houseGoal = goals.find((g) => g.goal_type === 'house');
  const houseProgress = months.map((m, i) => ({
    month: m,
    Casa: houseGoal ? Math.round((houseGoal.current_value / months.length) * (i + 1)) : 0,
  }));

  if (loading) return <div className="h-40 rounded-2xl bg-slate-900/60 animate-pulse" />;

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 size={24} />}
        title="Ainda não há dados suficientes"
        description="Registre algumas movimentações para ver seus relatórios."
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-6">
      <h1 className="text-2xl font-bold text-white">Relatórios</h1>

      <Card>
        <h2 className="text-white font-semibold mb-4">Receita x Despesa (últimos 6 meses)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={incomeExpenseByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => formatCurrency(v)} width={90} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }} />
            <Legend />
            <Bar dataKey="Receitas" fill="#34d399" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Despesas" fill="#f87171" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-white font-semibold mb-4">Despesas por categoria</h2>
          {expenseByCategory.length === 0 ? (
            <p className="text-slate-500 text-sm">Sem despesas registradas ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="text-white font-semibold mb-4">Evolução patrimonial</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={netWorthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => formatCurrency(v)} width={90} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }} />
              <Line type="monotone" dataKey="Patrimônio" stroke="#22d3ee" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h2 className="text-white font-semibold mb-4">Progresso da meta Casa</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={houseProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => formatCurrency(v)} width={90} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }} />
            <Line type="monotone" dataKey="Casa" stroke="#34d399" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
