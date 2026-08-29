import type { Transaction, Installment, Category, Goal } from '@/types/finance';
import { monthlyIncome, monthlyExpenses, currentMonthISO, calcHouseProjection } from '@/lib/financeCalculations';
import { formatCurrency } from '@/lib/format';

function previousMonthISO(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
}

export function buildInsights(
  transactions: Transaction[],
  categories: Category[],
  installments: Installment[],
  goals: Goal[],
  incomeGoal: number,
  houseTarget: number,
  houseTotalMonths: number,
): string[] {
  const insights: string[] = [];
  const thisMonth = currentMonthISO();
  const lastMonth = previousMonthISO();

  const income = monthlyIncome(transactions, thisMonth);
  const expenses = monthlyExpenses(transactions, thisMonth);
  const lastExpenses = monthlyExpenses(transactions, lastMonth);

  // Carro vs renda
  const carCategory = categories.find((c) => c.name.toLowerCase() === 'carro');
  if (carCategory && income > 0) {
    const carExpenses = transactions
      .filter((t) => t.type === 'expense' && t.category_id === carCategory.id && t.date.startsWith(thisMonth))
      .reduce((s, t) => s + Number(t.amount), 0);
    if (carExpenses > 0) {
      const pct = (carExpenses / income) * 100;
      insights.push(`Suas despesas com carro representam ${pct.toFixed(0)}% da sua renda deste mês.`);
    }
  }

  // Comparação com mês anterior
  if (lastExpenses > 0) {
    const diff = ((expenses - lastExpenses) / lastExpenses) * 100;
    if (diff < 0) {
      insights.push(`Você gastou ${Math.abs(diff).toFixed(0)}% menos que no mês anterior. 👏`);
    } else if (diff > 0) {
      insights.push(`Você gastou ${diff.toFixed(0)}% mais que no mês anterior.`);
    }
  }

  // Projeção casa
  const houseGoal = goals.find((g) => g.goal_type === 'house');
  if (houseGoal) {
    const created = new Date(houseGoal.created_at);
    const now = new Date();
    const monthsElapsed = Math.max(1, (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth()));
    const projection = calcHouseProjection(houseGoal.current_value, houseTarget, houseTotalMonths, monthsElapsed);

    if (projection.projectedCompletionMonths !== null) {
      insights.push(
        `Se mantiver o ritmo atual, você chegará aos ${formatCurrency(houseTarget)} em aproximadamente ${projection.projectedCompletionMonths} meses.`,
      );
    }

    if (projection.paceDiffPercent >= 0) {
      insights.push(`Você está ${Math.abs(projection.paceDiffPercent).toFixed(0)}% à frente do ritmo necessário para a casa.`);
    } else {
      insights.push(`Você está ${Math.abs(projection.paceDiffPercent).toFixed(0)}% abaixo do ritmo necessário para a casa.`);
    }
  }

  // Meta de renda
  if (incomeGoal > 0) {
    const pct = Math.min(100, (income / incomeGoal) * 100);
    insights.push(`Você está em ${pct.toFixed(0)}% da sua meta de renda mensal de ${formatCurrency(incomeGoal)}.`);
  }

  // Compromissos futuros
  const totalFuture = installments.reduce((sum, inst) => {
    const remaining = Math.max(0, inst.total_installments - inst.current_installment + 1);
    return sum + remaining * inst.installment_amount;
  }, 0);
  if (totalFuture > 0) {
    insights.push(`Seus compromissos futuros (parcelamentos) somam ${formatCurrency(totalFuture)}.`);
  }

  return insights;
}
