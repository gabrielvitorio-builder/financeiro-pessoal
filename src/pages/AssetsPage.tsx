import { useMemo, useState } from 'react';
import { Plus, Landmark, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal, FormField, inputClass } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/format';
import { sumAssets, sumLiabilities, netWorth } from '@/lib/financeCalculations';
import * as svc from '@/services/financeService';
import type { Asset, AssetType, Liability, LiabilityType } from '@/types/finance';

const ASSET_LABELS: Record<AssetType, string> = {
  account: 'Conta', reserve: 'Reserva', investment: 'Investimento',
  fgts: 'FGTS', vehicle: 'Veículo', property: 'Imóvel', other: 'Outro',
};
const LIABILITY_LABELS: Record<LiabilityType, string> = {
  financing: 'Financiamento', card: 'Cartão', loan: 'Empréstimo', other: 'Outra dívida',
};

export default function AssetsPage() {
  const { user } = useAuth();
  const { loading, accounts, assets, liabilities, refresh } = useFinanceData();
  const [editingAsset, setEditingAsset] = useState<Asset | null | 'new'>(null);
  const [editingLiability, setEditingLiability] = useState<Liability | null | 'new'>(null);

  const gross = useMemo(() => sumAssets(accounts, assets), [accounts, assets]);
  const totalLiabilities = useMemo(() => sumLiabilities(liabilities), [liabilities]);
  const worth = useMemo(() => netWorth(accounts, assets, liabilities), [accounts, assets, liabilities]);

  async function handleDeleteAsset(a: Asset) {
    if (!window.confirm(`Excluir o ativo "${a.name}"?`)) return;
    await svc.deleteAsset(a.id);
    await refresh();
  }
  async function handleDeleteLiability(l: Liability) {
    if (!window.confirm(`Excluir a dívida "${l.name}"?`)) return;
    await svc.deleteLiability(l.id);
    await refresh();
  }

  if (loading) return <div className="h-40 rounded-2xl bg-slate-900/60 animate-pulse" />;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-6">
      <h1 className="text-2xl font-bold text-white">Patrimônio</h1>

      <Card>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-slate-500 text-xs mb-1">Patrimônio bruto</p>
            <p className="text-white font-bold">{formatCurrency(gross)}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Passivos</p>
            <p className="text-rose-400 font-bold">- {formatCurrency(totalLiabilities)}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Patrimônio líquido</p>
            <p className="text-emerald-400 font-bold">{formatCurrency(worth)}</p>
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Ativos</h2>
          <button onClick={() => setEditingAsset('new')} className="flex items-center gap-2 rounded-xl bg-slate-800 text-white font-medium px-4 py-2 text-sm hover:bg-slate-700">
            <Plus size={16} /> Novo ativo
          </button>
        </div>
        {assets.length === 0 ? (
          <EmptyState icon={<Landmark size={24} />} title="Nenhum ativo cadastrado" description="Ex: FGTS, veículo, investimentos." />
        ) : (
          <div className="space-y-2">
            {assets.map((a) => (
              <Card key={a.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-white font-medium">{a.name}</p>
                  <p className="text-slate-500 text-xs">{ASSET_LABELS[a.asset_type]}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold">{formatCurrency(a.value)}</span>
                  <button onClick={() => setEditingAsset(a)} aria-label="Editar ativo" className="text-slate-500 hover:text-white"><Pencil size={15} /></button>
                  <button onClick={() => handleDeleteAsset(a)} aria-label="Excluir ativo" className="text-slate-500 hover:text-rose-400"><Trash2 size={15} /></button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Passivos</h2>
          <button onClick={() => setEditingLiability('new')} className="flex items-center gap-2 rounded-xl bg-slate-800 text-white font-medium px-4 py-2 text-sm hover:bg-slate-700">
            <Plus size={16} /> Nova dívida
          </button>
        </div>
        {liabilities.length === 0 ? (
          <EmptyState icon={<Landmark size={24} />} title="Nenhuma dívida cadastrada" description="Ex: financiamento do carro." />
        ) : (
          <div className="space-y-2">
            {liabilities.map((l) => (
              <Card key={l.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-white font-medium">{l.name}</p>
                  <p className="text-slate-500 text-xs">{LIABILITY_LABELS[l.liability_type]}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-rose-400 font-semibold">{formatCurrency(l.value)}</span>
                  <button onClick={() => setEditingLiability(l)} aria-label="Editar dívida" className="text-slate-500 hover:text-white"><Pencil size={15} /></button>
                  <button onClick={() => handleDeleteLiability(l)} aria-label="Excluir dívida" className="text-slate-500 hover:text-rose-400"><Trash2 size={15} /></button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {editingAsset && user && (
        <AssetModal asset={editingAsset === 'new' ? null : editingAsset} userId={user.id} onClose={() => setEditingAsset(null)} onSaved={refresh} />
      )}
      {editingLiability && user && (
        <LiabilityModal liability={editingLiability === 'new' ? null : editingLiability} userId={user.id} onClose={() => setEditingLiability(null)} onSaved={refresh} />
      )}
    </div>
  );
}

function AssetModal({ asset, userId, onClose, onSaved }: { asset: Asset | null; userId: string; onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(asset?.name ?? '');
  const [value, setValue] = useState(String(asset?.value ?? ''));
  const [assetType, setAssetType] = useState<AssetType>(asset?.asset_type ?? 'other');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !value) { setError('Informe nome e valor.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await svc.upsertAsset(userId, { id: asset?.id, name: name.trim(), value: Number(value.replace(',', '.')), asset_type: assetType });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar ativo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={asset ? 'Editar ativo' : 'Novo ativo'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nome"><input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ex: FGTS" /></FormField>
        <FormField label="Tipo">
          <select value={assetType} onChange={(e) => setAssetType(e.target.value as AssetType)} className={inputClass}>
            {Object.entries(ASSET_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </FormField>
        <FormField label="Valor (R$)"><input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" className={inputClass} /></FormField>
        {error && <div role="alert" className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-3 py-2">{error}</div>}
        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold py-3 disabled:opacity-60">
          {submitting ? 'Salvando…' : 'Salvar'}
        </button>
      </form>
    </Modal>
  );
}

function LiabilityModal({ liability, userId, onClose, onSaved }: { liability: Liability | null; userId: string; onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(liability?.name ?? '');
  const [value, setValue] = useState(String(liability?.value ?? ''));
  const [liabilityType, setLiabilityType] = useState<LiabilityType>(liability?.liability_type ?? 'other');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !value) { setError('Informe nome e valor.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await svc.upsertLiability(userId, { id: liability?.id, name: name.trim(), value: Number(value.replace(',', '.')), liability_type: liabilityType });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dívida.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={liability ? 'Editar dívida' : 'Nova dívida'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nome"><input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ex: Financiamento do carro" /></FormField>
        <FormField label="Tipo">
          <select value={liabilityType} onChange={(e) => setLiabilityType(e.target.value as LiabilityType)} className={inputClass}>
            {Object.entries(LIABILITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </FormField>
        <FormField label="Valor do saldo devedor (R$)"><input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" className={inputClass} /></FormField>
        {error && <div role="alert" className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-3 py-2">{error}</div>}
        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold py-3 disabled:opacity-60">
          {submitting ? 'Salvando…' : 'Salvar'}
        </button>
      </form>
    </Modal>
  );
}
