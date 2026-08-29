import { useMemo, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinanceData } from '@/hooks/useFinanceData';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDateBR } from '@/lib/format';
import * as svc from '@/services/financeService';
import type { Transaction } from '@/types/finance';

const TYPE_ICON = {
  income: <ArrowUpCircle className="text-emerald-400" size={20} />,
  expense: <ArrowDownCircle className="text-rose-400" size={20} />,
  transfer: <ArrowLeftRight className="text-cyan-400" size={20} />,
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const { loading, transactions, categories, accounts, refresh } = useFinanceData();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const key = t.date.slice(0, 7);
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [transactions]);

  async function handleDelete(tx: Transaction) {
    if (!user) return;
    if (!window.confirm('Excluir esta movimentação? Essa ação não pode ser desfeita.')) return;
    setDeletingId(tx.id);
    try {
      await svc.deleteTransaction(tx);
      await refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Erro ao excluir movimentação.');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-900/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<ArrowLeftRight size={24} />}
        title="Nenhuma movimentação ainda"
        description="Use o botão + para registrar sua primeira receita ou despesa."
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-6">
      <h1 className="text-2xl font-bold text-white">Movimentações</h1>

      {grouped.map(([month, txs]) => (
        <div key={month}>
          <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2 px-1">
            {new Date(`${month}-01T00:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="space-y-2">
            {txs.map((t) => {
              const category = categories.find((c) => c.id === t.category_id);
              const account = accounts.find((a) => a.id === t.account_id);
              const sign = t.type === 'income' ? '+' : t.type === 'expense' ? '-' : '';
              const color =
                t.type === 'income' ? 'text-emerald-400' : t.type === 'expense' ? 'text-rose-400' : 'text-cyan-400';

              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 bg-slate-900/70 border border-slate-800 rounded-xl px-4 py-3"
                >
                  {TYPE_ICON[t.type]}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{t.description}</p>
                    <p className="text-slate-500 text-xs truncate">
                      {category ? `${category.icon} ${category.name}` : 'Sem categoria'}
                      {account ? ` · ${account.name}` : ''} · {formatDateBR(t.date)}
                    </p>
                  </div>
                  <span className={`font-semibold text-sm ${color}`}>
                    {sign}{formatCurrency(t.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(t)}
                    disabled={deletingId === t.id}
                    aria-label="Excluir movimentação"
                    className="text-slate-600 hover:text-rose-400 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
