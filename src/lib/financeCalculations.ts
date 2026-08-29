import type { Account, Asset, Liability, Transaction } from '@/types/finance';

export function sumAssets(accounts: Account[], assets: Asset[]): number {
  const accountsTotal = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const assetsTotal = assets.reduce((s, a) => s + Number(a.value), 0);
  return accountsTotal + assetsTotal;
}

export function sumLiabilities(liabilities: Liability[]): number {
  return liabilities.reduce((s, l) => s + Number(l.value), 0);
}

export function netWorth(accounts: Account[], assets: Asset[], liabilities: Liability[]): number {
  return sumAssets(accounts, assets) - sumLiabilities(liabilities);
}

export function reserveTotal(accounts: Account[]): number {
  return accounts.filter((a) => a.is_reserve).reduce((s, a) => s + Number(a.balance), 0);
}

// Dinheiro disponível = saldos de contas marcadas como "disponível" e não reserva
export function availableCash(accounts: Account[]): number {
  return accounts
    .filter((a) => a.is_available && !a.is_reserve)
    .reduce((s, a) => s + Number(a.balance), 0);
}

export function monthlyIncome(transactions: Transaction[], monthISO: string): number {
  return transactions
    .filter((t) => t.type === 'income' && t.date.startsWith(monthISO))
    .reduce((s, t) => s + Number(t.amount), 0);
}

export function monthlyExpenses(transactions: Transaction[], monthISO: string): number {
  return transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(monthISO))
    .reduce((s, t) => s + Number(t.amount), 0);
}

export function currentMonthISO(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

export interface HouseProjection {
  current: number;
  target: number;
  percent: number;
  remaining: number;
  recommendedMonthly: number;
  monthsElapsed: number;
  monthsRemaining: number;
  paceMonthlyAvg: number;
  paceDiffPercent: number; // positivo = à frente, negativo = abaixo
  projectedCompletionMonths: number | null;
}

export function calcHouseProjection(
  current: number,
  target: number,
  totalMonths: number,
  monthsElapsed: number,
): HouseProjection {
  const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const remaining = Math.max(0, target - current);
  const monthsRemaining = Math.max(1, totalMonths - monthsElapsed);
  const recommendedMonthly = remaining / monthsRemaining;

  const elapsedSafe = Math.max(1, monthsElapsed);
  const paceMonthlyAvg = current / elapsedSafe;
  const neededPaceSoFar = (target / totalMonths) * elapsedSafe;
  const paceDiffPercent = neededPaceSoFar > 0
    ? ((current - neededPaceSoFar) / neededPaceSoFar) * 100
    : 0;

  const projectedCompletionMonths = paceMonthlyAvg > 0
    ? Math.ceil(target / paceMonthlyAvg)
    : null;

  return {
    current, target, percent, remaining, recommendedMonthly,
    monthsElapsed, monthsRemaining, paceMonthlyAvg, paceDiffPercent,
    projectedCompletionMonths,
  };
}

export interface Milestone {
  value: number;
  label: string;
  emoji: string;
  reached: boolean;
}

export function buildMilestones(current: number, target: number): Milestone[] {
  const steps: Array<{ ratio: number; label: string; emoji: string }> = [
    { ratio: 0.1, label: 'Começo', emoji: '🌱' },
    { ratio: 0.2, label: 'Primeiro grande avanço', emoji: '🚀' },
    { ratio: 0.5, label: 'Metade do caminho', emoji: '🔥' },
    { ratio: 1.0, label: 'Entrada conquistada', emoji: '🏠' },
  ];
  return steps.map((s) => {
    const value = Math.round(target * s.ratio);
    return { value, label: s.label, emoji: s.emoji, reached: current >= value };
  });
}
