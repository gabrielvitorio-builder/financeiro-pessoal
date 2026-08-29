import { useState } from 'react';
import { Plus, Wallet, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal, FormField, inputClass } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/format';
import * as svc from '@/services/financeService';
import type { Account } from '@/types/finance';

export default function AccountsPage() {
  const { user } = useAuth();
  const { loading, accounts, refresh } = useFinanceData();
  const [editing, setEditing] = useState<Account | null | 'new'>(null);
  const [busy, setBusy] = useState(false);

  async function handleDelete(acc: Account) {
    if (!window.confirm(`Excluir a conta "${acc.name}"? Movimentações associadas não serão apagadas.`)) return;
    setBusy(true);
    try {
      await svc.deleteAccount(acc.id);
      await refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Erro ao excluir conta.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="h-40 rounded-2xl bg-slate-900/60 animate-pulse" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Contas</h1>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold px-4 py-2 text-sm active:scale-[0.98] transition-transform"
        >
          <Plus size={16} /> Nova conta
        </button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          icon={<Wallet size={24} />}
          title="Nenhuma conta cadastrada"
          description="Cadastre suas contas (ex: Mercado Pago, Nubank) para acompanhar saldos."
          action={
            <button
              onClick={() => setEditing('new')}
              className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold px-4 py-2 text-sm"
            >
              Criar primeira conta
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {accounts.map((a) => (
            <Card key={a.id} className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Wallet size={18} className="text-slate-950" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(a)}
                    aria-label={`Editar ${a.name}`}
                    className="text-slate-500 hover:text-white p-1"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(a)}
                    disabled={busy}
                    aria-label={`Excluir ${a.name}`}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-white font-semibold">{a.name}</p>
              <p className="text-xl font-bold text-white mt-1">{formatCurrency(a.balance)}</p>
              <div className="flex gap-2 mt-3">
                {a.is_reserve && (
                  <span className="flex items-center gap-1 text-xs bg-amber-950/50 text-amber-400 border border-amber-900 rounded-full px-2 py-0.5">
                    <ShieldCheck size={12} /> Reserva
                  </span>
                )}
                {a.is_available && !a.is_reserve && (
                  <span className="text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-900 rounded-full px-2 py-0.5">
                    Disponível
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && user && (
        <AccountModal
          account={editing === 'new' ? null : editing}
          userId={user.id}
          onClose={() => setEditing(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}

function AccountModal({
  account,
  userId,
  onClose,
  onSaved,
}: {
  account: Account | null;
  userId: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(account?.name ?? '');
  const [balance, setBalance] = useState(String(account?.balance ?? '0'));
  const [isReserve, setIsReserve] = useState(account?.is_reserve ?? false);
  const [isAvailable, setIsAvailable] = useState(account?.is_available ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe um nome para a conta.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await svc.upsertAccount(userId, {
        id: account?.id,
        name: name.trim(),
        balance: Number(balance.replace(',', '.')) || 0,
        is_reserve: isReserve,
        is_available: isAvailable,
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar conta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={account ? 'Editar conta' : 'Nova conta'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nome">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ex: Nubank" />
        </FormField>
        <FormField label="Saldo atual (R$)">
          <input value={balance} onChange={(e) => setBalance(e.target.value)} inputMode="decimal" className={inputClass} />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={isReserve} onChange={(e) => setIsReserve(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" />
          Esta conta é uma reserva de emergência
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" />
          Considerar como dinheiro disponível
        </label>
        {error && <div role="alert" className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-3 py-2">{error}</div>}
        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold py-3 disabled:opacity-60">
          {submitting ? 'Salvando…' : 'Salvar'}
        </button>
      </form>
    </Modal>
  );
}
