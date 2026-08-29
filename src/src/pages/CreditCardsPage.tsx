import { useMemo, useState } from 'react';
import { Plus, CreditCard as CardIcon, Trash2, Pencil, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal, FormField, inputClass } from '@/components/ui/Modal';
import { formatCurrency, formatDateBR } from '@/lib/format';
import * as svc from '@/services/financeService';
import type { CreditCard, Installment } from '@/types/finance';

export default function CreditCardsPage() {
  const { user } = useAuth();
  const { loading, creditCards, installments, refresh } = useFinanceData();
  const [editingCard, setEditingCard] = useState<CreditCard | null | 'new'>(null);
  const [editingInst, setEditingInst] = useState<Installment | null | 'new'>(null);

  const totalFuture = useMemo(
    () => installments.reduce((sum, inst) => {
      const remaining = Math.max(0, inst.total_installments - inst.current_installment + 1);
      return sum + remaining * inst.installment_amount;
    }, 0),
    [installments],
  );

  async function handleDeleteCard(c: CreditCard) {
    if (!window.confirm(`Excluir o cartão "${c.name}"?`)) return;
    await svc.deleteCreditCard(c.id);
    await refresh();
  }

  async function handleDeleteInst(i: Installment) {
    if (!window.confirm(`Excluir o parcelamento "${i.description}"?`)) return;
    await svc.deleteInstallment(i.id);
    await refresh();
  }

  if (loading) return <div className="h-40 rounded-2xl bg-slate-900/60 animate-pulse" />;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Cartões</h1>
        <button
          onClick={() => setEditingCard('new')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold px-4 py-2 text-sm"
        >
          <Plus size={16} /> Novo cartão
        </button>
      </div>

      {creditCards.length === 0 ? (
        <EmptyState icon={<CardIcon size={24} />} title="Nenhum cartão cadastrado" description="Cadastre seus cartões (ex: Nubank, Mercado Pago)." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {creditCards.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-400 to-violet-500 flex items-center justify-center">
                  <CardIcon size={18} className="text-slate-950" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingCard(c)} aria-label={`Editar ${c.name}`} className="text-slate-500 hover:text-white p-1"><Pencil size={15} /></button>
                  <button onClick={() => handleDeleteCard(c)} aria-label={`Excluir ${c.name}`} className="text-slate-500 hover:text-rose-400 p-1"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="text-white font-semibold">{c.name}</p>
              <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                {c.limit_amount != null && <p>Limite: {formatCurrency(c.limit_amount)}</p>}
                {c.closing_day != null && <p>Fechamento: dia {c.closing_day}</p>}
                {c.due_day != null && <p>Vencimento: dia {c.due_day}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-white">Parcelamentos</h2>
            <p className="text-slate-500 text-sm">Compromisso futuro total: <span className="text-white font-medium">{formatCurrency(totalFuture)}</span></p>
          </div>
          <button
            onClick={() => setEditingInst('new')}
            className="flex items-center gap-2 rounded-xl bg-slate-800 text-white font-medium px-4 py-2 text-sm hover:bg-slate-700"
          >
            <Plus size={16} /> Parcelamento
          </button>
        </div>

        {installments.length === 0 ? (
          <EmptyState icon={<Layers size={24} />} title="Nenhum parcelamento cadastrado" />
        ) : (
          <div className="space-y-3">
            {installments.map((i) => {
              const remaining = Math.max(0, i.total_installments - i.current_installment + 1);
              const card = creditCards.find((c) => c.id === i.credit_card_id);
              return (
                <Card key={i.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-semibold">{i.description}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {card?.name ?? 'Sem cartão'} · {i.current_installment}/{i.total_installments} · início {formatDateBR(i.first_due_date)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingInst(i)} aria-label="Editar parcelamento" className="text-slate-500 hover:text-white p-1"><Pencil size={15} /></button>
                      <button onClick={() => handleDeleteInst(i)} aria-label="Excluir parcelamento" className="text-slate-500 hover:text-rose-400 p-1"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Parcela</p>
                      <p className="text-sm font-semibold text-white">{formatCurrency(i.installment_amount)}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Restantes</p>
                      <p className="text-sm font-semibold text-white">{remaining}x</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Total restante</p>
                      <p className="text-sm font-semibold text-white">{formatCurrency(remaining * i.installment_amount)}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {editingCard && user && (
        <CreditCardModal card={editingCard === 'new' ? null : editingCard} userId={user.id} onClose={() => setEditingCard(null)} onSaved={refresh} />
      )}
      {editingInst && user && (
        <InstallmentModal inst={editingInst === 'new' ? null : editingInst} userId={user.id} cards={creditCards} onClose={() => setEditingInst(null)} onSaved={refresh} />
      )}
    </div>
  );
}

function CreditCardModal({ card, userId, onClose, onSaved }: { card: CreditCard | null; userId: string; onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(card?.name ?? '');
  const [limitAmount, setLimitAmount] = useState(String(card?.limit_amount ?? ''));
  const [closingDay, setClosingDay] = useState(String(card?.closing_day ?? ''));
  const [dueDay, setDueDay] = useState(String(card?.due_day ?? ''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Informe um nome para o cartão.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await svc.upsertCreditCard(userId, {
        id: card?.id,
        name: name.trim(),
        limit_amount: limitAmount ? Number(limitAmount.replace(',', '.')) : null,
        closing_day: closingDay ? Number(closingDay) : null,
        due_day: dueDay ? Number(dueDay) : null,
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cartão.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={card ? 'Editar cartão' : 'Novo cartão'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nome"><input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ex: Nubank" /></FormField>
        <FormField label="Limite (R$)"><input value={limitAmount} onChange={(e) => setLimitAmount(e.target.value)} inputMode="decimal" className={inputClass} /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Dia de fechamento"><input value={closingDay} onChange={(e) => setClosingDay(e.target.value)} inputMode="numeric" className={inputClass} /></FormField>
          <FormField label="Dia de vencimento"><input value={dueDay} onChange={(e) => setDueDay(e.target.value)} inputMode="numeric" className={inputClass} /></FormField>
        </div>
        {error && <div role="alert" className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-3 py-2">{error}</div>}
        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold py-3 disabled:opacity-60">
          {submitting ? 'Salvando…' : 'Salvar'}
        </button>
      </form>
    </Modal>
  );
}

function InstallmentModal({ inst, userId, cards, onClose, onSaved }: { inst: Installment | null; userId: string; cards: CreditCard[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const [description, setDescription] = useState(inst?.description ?? '');
  const [totalAmount, setTotalAmount] = useState(String(inst?.total_amount ?? ''));
  const [installmentAmount, setInstallmentAmount] = useState(String(inst?.installment_amount ?? ''));
  const [totalInstallments, setTotalInstallments] = useState(String(inst?.total_installments ?? '1'));
  const [currentInstallment, setCurrentInstallment] = useState(String(inst?.current_installment ?? '1'));
  const [creditCardId, setCreditCardId] = useState(inst?.credit_card_id ?? '');
  const [firstDueDate, setFirstDueDate] = useState(inst?.first_due_date ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !installmentAmount || !totalInstallments || !firstDueDate) {
      setError('Preencha descrição, valor da parcela, quantidade e data.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await svc.upsertInstallment(userId, {
        id: inst?.id,
        description: description.trim(),
        total_amount: Number(totalAmount.replace(',', '.')) || Number(installmentAmount.replace(',', '.')) * Number(totalInstallments),
        installment_amount: Number(installmentAmount.replace(',', '.')),
        total_installments: Number(totalInstallments),
        current_installment: Number(currentInstallment) || 1,
        credit_card_id: creditCardId || null,
        first_due_date: firstDueDate,
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar parcelamento.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={inst ? 'Editar parcelamento' : 'Novo parcelamento'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Descrição"><input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="Ex: Compra parcelada" /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Valor da parcela (R$)"><input value={installmentAmount} onChange={(e) => setInstallmentAmount(e.target.value)} inputMode="decimal" className={inputClass} /></FormField>
          <FormField label="Valor total (R$, opcional)"><input value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} inputMode="decimal" className={inputClass} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Total de parcelas"><input value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} inputMode="numeric" className={inputClass} /></FormField>
          <FormField label="Parcela atual"><input value={currentInstallment} onChange={(e) => setCurrentInstallment(e.target.value)} inputMode="numeric" className={inputClass} /></FormField>
        </div>
        <FormField label="Cartão">
          <select value={creditCardId} onChange={(e) => setCreditCardId(e.target.value)} className={inputClass}>
            <option value="">Nenhum</option>
            {cards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField label="Primeiro vencimento"><input type="date" value={firstDueDate} onChange={(e) => setFirstDueDate(e.target.value)} className={inputClass} /></FormField>
        {error && <div role="alert" className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-3 py-2">{error}</div>}
        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold py-3 disabled:opacity-60">
          {submitting ? 'Salvando…' : 'Salvar'}
        </button>
      </form>
    </Modal>
  );
}
