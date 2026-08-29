import type { AchievementDef, AchievementContext } from '@/types/finance';

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { code: 'house_1000', emoji: '🎯', label: 'Primeiro R$ 1.000 guardado', check: (c) => c.houseCurrent >= 1000 },
  { code: 'house_5000', emoji: '🌱', label: 'R$ 5.000 guardados', check: (c) => c.houseCurrent >= 5000 },
  { code: 'house_10000', emoji: '🚀', label: 'R$ 10.000 guardados', check: (c) => c.houseCurrent >= 10000 },
  { code: 'house_25000', emoji: '🔥', label: 'R$ 25.000 guardados', check: (c) => c.houseCurrent >= 25000 },
  { code: 'house_50000', emoji: '🏠', label: 'R$ 50.000 — entrada conquistada!', check: (c) => c.houseCurrent >= 50000 },
  { code: 'income_10000_month', emoji: '💼', label: 'Primeiro mês com R$ 10.000 de renda', check: (c) => c.monthlyIncomeMax >= 10000 },
  { code: 'income_increase', emoji: '📈', label: 'Aumento de renda', check: (c) => c.hadIncomeIncrease },
  { code: 'within_budget', emoji: '🧾', label: 'Primeiro mês dentro do orçamento', check: (c) => c.hadMonthWithinBudget },
];

export function evaluateAchievements(ctx: AchievementContext): string[] {
  return ACHIEVEMENT_DEFS.filter((def) => def.check(ctx)).map((def) => def.code);
}
