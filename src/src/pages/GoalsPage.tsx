import { useState } from 'react';
import { Plus, Target, Pencil, Trash2, Home, Car } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal, FormField, inputClass } from '@/components/ui/Modal';
import { formatCurrency, formatDateBR } from '@/lib/format';
import * as svc from '@/services/financeService';
import type { Goal, GoalType } from '@/types/finance';

const GOAL_ICONS: Record<GoalType, JSX.Element> = {
  house: <Home size={18} className="text-slate-950" />,
  car: <Car size={18} className="text-slate-950" />,
  income: <Target size={18} className="text-slate-950" />,
  custom: <Target size={18} className="text-slate-950" />,
};

export default function GoalsPage() {
  const { user } = useAuth();
  const { loading, goals, refresh } = useFinanceData();
  const [editing, setEditing] = useState<Goal | null | 'new'>(null);

  async function handleDelete(g: Goal) {
    if (!window.confirm(`Excluir a meta "${g.name}"?`)) return;
    await svc.deleteGoal(g.id);
    await refresh();
  }

  if (loading) return <div className="h-40 rounded-2xl bg-slate-900/60 animate-pulse" />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Metas</h1>
        <button onClick={() => setEditing('new')} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold px-4 py-2 text-sm">
          <Plus size={16} /> Nova meta
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState icon={<Target size={24} />} title="Nenhuma meta cadastrada" description="Crie sua meta da casa, do carro ou outras." />
      ) : (
        <div className="grid gap-4">
          {goals.map((g) => {
            const percent = g.target_value > 0 ? Math.min(100, (g.current_value / g.target_value) * 100) : 0;
            return (
              <Card key={g.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                      {GOAL_ICONS[g.goal_type]}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{g.name}</p>
                      {g.deadline && <p className="text-slate-500 text-xs">Prazo: {formatDateBR(g.deadline)}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(g)} aria-label="Editar meta" className="text-slate-500 hover:text-white p-1"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(g)} aria-label="Excluir meta" className="text-slate-500 hover:text-rose-400 p-1"><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-xl font-bold text-white">{formatCurrency(g.current_value)}</span>
                  <span className="text-slate-400 text-sm">de {formatCurrency(g.target_value)}</span>
                </div>
                <ProgressBar percent={percent} />
                {g.description && <p className="text-slate-500 text-sm mt-3">{g.description}</p>}
              </Card>
            );
          })}
        </div>
      )}

      {editing && user && (
        <GoalModal goal={editing === 'new' ? null : editing} userId={user.id} onClose={() => setEditing(null)} onSaved={refresh} />
      )}
    </div>
  );
}

function GoalModal({ goal, userId, onClose, onSaved }: { goal: Goal | null; userId: string; onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(goal?.name ?? '');
  const [goalType, setGoalType] = useState<GoalType>(goal?.goal_type ?? 'custom');
  const [targetValue, setTargetValue] = useState(String(goal?.target_value ?? ''));
  const [currentValue, setCurrentValue] = useState(String(goal?.current_value ?? '0'));
  const [deadline, setDeadline] = useState(goal?.deadline ?? '');
const [priority] = useState(String(goal?.priority ?? '0'));  const [description, setDescription] = useState(goal?.description ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !targetValue) { setError('Informe nome e valor objetivo.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await svc.upsertGoal(userId, {
        id: goal?.id,
        name: name.trim(),
        goal_type: goalType,
        target_value: Number(targetValue.replace(',', '.')),
        current_value: Number(currentValue.replace(',', '.')) || 0,
        deadline: deadline || null,
        priority: Number(priority) || 0,
        description: description.trim() || null,
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar meta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={goal ? 'Editar meta' : 'Nova meta'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nome"><input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ex: Casa própria" /></FormField>
        <FormField label="Tipo">
          <select value={goalType} onChange={(e) => setGoalType(e.target.value as GoalType)} className={inputClass}>
            <option value="house">🏠 Casa</option>
            <option value="car">🚗 Carro</option>
            <option value="income">📈 Renda</option>
            <option value="custom">🎯 Outra</option>
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Valor objetivo (R$)"><input value={targetValue} onChange={(e) => setTargetValue(e.target.value)} inputMode="decimal" className={inputClass} /></FormField>
          <FormField label="Valor atual (R$)"><input value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} inputMode="decimal" className={inputClass} /></FormField>
        </div>
        <FormField label="Prazo (opcional)"><input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} /></FormField>
        <FormField label="Descrição (opcional)"><input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} /></FormField>
        {error && <div role="alert" className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-3 py-2">{error}</div>}
        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold py-3 disabled:opacity-60">
          {submitting ? 'Salvando…' : 'Salvar'}
        </button>
      </form>
    </Modal>
  );
}
