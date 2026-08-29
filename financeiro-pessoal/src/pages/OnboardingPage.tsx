import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { inputClass } from '@/components/ui/Modal';
import * as svc from '@/services/financeService';

const STEPS = ['Renda', 'Contas', 'Reserva', 'Dívidas', 'Patrimônio', 'Objetivos'];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState('10000');
  const [accountName, setAccountName] = useState('Mercado Pago');
  const [accountBalance, setAccountBalance] = useState('0');
  const [reserveValue, setReserveValue] = useState('5000');
  const [liabilityValue, setLiabilityValue] = useState('970');
  const [fgtsValue, setFgtsValue] = useState('13000');
  const [vehicleValue, setVehicleValue] = useState('37000');
  const [houseTarget, setHouseTarget] = useState('50000');
  const [houseMonths, setHouseMonths] = useState('12');

  async function finishOnboarding() {
    if (!user) return;
    setSaving(true);
    try {
      await svc.ensureAccount(user.id, accountName || 'Mercado Pago', Number(accountBalance) || 0, false, true);
      await svc.ensureAccount(user.id, 'Reserva de Emergência', Number(reserveValue) || 0, true, false);
      await svc.ensureAsset(user.id, 'FGTS', Number(fgtsValue) || 0, 'fgts');
      await svc.ensureAsset(user.id, 'Fiat Idea Attractive 1.4 2014', Number(vehicleValue) || 0, 'vehicle');
      await svc.ensureLiability(user.id, 'Financiamento do veículo', Number(liabilityValue) || 0, 'financing');
      await svc.ensureGoal(user.id, {
        name: 'Casa', goal_type: 'house', target_value: Number(houseTarget) || 50000,
        current_value: Number(reserveValue) ? 0 : 0, deadline: null, priority: 1,
        description: 'Primeiro marco financeiro rumo à casa própria.',
      });
      await svc.ensureGoal(user.id, {
        name: 'Renda', goal_type: 'income', target_value: Number(monthlyIncomeGoal) || 10000,
        current_value: 0, deadline: null, priority: 2, description: 'Meta de renda mensal.',
      });
      await svc.upsertFinancialSettings(user.id, {
        monthly_income_goal: Number(monthlyIncomeGoal) || 10000,
        house_goal_value: Number(houseTarget) || 50000,
        house_goal_months: Number(houseMonths) || 12,
        onboarding_completed: true,
        onboarding_step: STEPS.length,
      });
      navigate('/');
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Erro ao salvar onboarding.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    if (!user) return;
    await svc.upsertFinancialSettings(user.id, { onboarding_completed: true });
    navigate('/');
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mb-3">
            <Home size={22} className="text-slate-950" />
          </div>
          <h1 className="text-xl font-bold text-white text-center">Vamos configurar sua vida financeira.</h1>
        </div>

        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-emerald-400' : 'bg-slate-800'}`} />
          ))}
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">Etapa {step + 1} de {STEPS.length}</p>
          <h2 className="text-white font-bold text-lg mb-2">{STEPS[step]}</h2>

          {step === 0 && (
            <div>
              <label className="block text-sm text-slate-300 mb-1">Meta de renda mensal (R$)</label>
              <input value={monthlyIncomeGoal} onChange={(e) => setMonthlyIncomeGoal(e.target.value)} inputMode="decimal" className={inputClass} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Nome da conta principal</label>
                <input value={accountName} onChange={(e) => setAccountName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Saldo atual (R$)</label>
                <input value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} inputMode="decimal" className={inputClass} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm text-slate-300 mb-1">Reserva de emergência (R$)</label>
              <input value={reserveValue} onChange={(e) => setReserveValue(e.target.value)} inputMode="decimal" className={inputClass} />
              <p className="text-slate-500 text-xs mt-2">Esse valor fica separado — não conta como dinheiro disponível.</p>
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="block text-sm text-slate-300 mb-1">Parcela do financiamento do veículo (R$)</label>
              <input value={liabilityValue} onChange={(e) => setLiabilityValue(e.target.value)} inputMode="decimal" className={inputClass} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">FGTS (R$)</label>
                <input value={fgtsValue} onChange={(e) => setFgtsValue(e.target.value)} inputMode="decimal" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Valor do veículo (R$)</label>
                <input value={vehicleValue} onChange={(e) => setVehicleValue(e.target.value)} inputMode="decimal" className={inputClass} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Meta da casa (R$)</label>
                <input value={houseTarget} onChange={(e) => setHouseTarget(e.target.value)} inputMode="decimal" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Prazo (meses)</label>
                <input value={houseMonths} onChange={(e) => setHouseMonths(e.target.value)} inputMode="numeric" className={inputClass} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <button onClick={handleSkip} className="text-slate-500 text-sm hover:text-slate-300">
              Pular por agora
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1 rounded-xl bg-slate-800 text-white px-4 py-2 text-sm"
                >
                  <ChevronLeft size={16} /> Voltar
                </button>
              )}
              {!isLast ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold px-4 py-2 text-sm"
                >
                  Avançar <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={finishOnboarding}
                  disabled={saving}
                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold px-4 py-2 text-sm disabled:opacity-60"
                >
                  <CheckCircle2 size={16} /> {saving ? 'Salvando…' : 'Concluir'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
