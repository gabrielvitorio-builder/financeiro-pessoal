import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinanceData } from '@/hooks/useFinanceData';
import * as svc from '@/services/financeService';
import { todayISO } from '@/lib/format';
import type { TransactionType } from '@/types/finance';

const TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
};

export default function NewTransactionModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { accounts, categories, creditCards, refresh } = useFinanceData();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [creditCardId, setCreditCardId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type || type === 'transfer'),
    [categories, type],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const numericAmount = Number(amount.replace(',', '.'));
    if (!numericAmount || numericAmount <= 0) {
      setError('Informe um valor válido.');
      return;
    }
    if (!description.trim()) {
      setError('Informe uma descrição.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await svc.createTransaction(user.id, {
        type,
        amount: numericAmount,
        description: description.trim(),
        category_id: categoryId || null,
        account_id: accountId || null,
        credit_card_id: creditCardId || null,
        date,
      });
      await refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar movimentação.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nova movimentação"
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl md:rounded-3xl p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Nova movimentação</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-slate-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="flex gap-2 mb-5">
          {(Object.keys(TYPE_LABELS) as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                type === t
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm text-slate-300 mb-1">Valor (R$)</label>
            <input
              id="amount"
              inputMode="decimal"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm text-slate-300 mb-1">Descrição</label>
            <input
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {type !== 'transfer' && (
            <div>
              <label htmlFor="category" className="block text-sm text-slate-300 mb-1">Categoria</label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Sem categoria</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="account" className="block text-sm text-slate-300 mb-1">Conta</label>
            <select
              id="account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Selecione uma conta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {type === 'expense' && creditCards.length > 0 && (
            <div>
              <label htmlFor="card" className="block text-sm text-slate-300 mb-1">Cartão (opcional)</label>
              <select
                id="card"
                value={creditCardId}
                onChange={(e) => setCreditCardId(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Nenhum</option>
                {creditCards.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="date" className="block text-sm text-slate-300 mb-1">Data</label>
            <input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <div role="alert" className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold py-3 transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? 'Salvando…' : 'Salvar movimentação'}
          </button>
        </form>
      </div>
    </div>
  );
}
