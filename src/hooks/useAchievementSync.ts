import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as svc from '@/services/financeService';
import { evaluateAchievements } from '@/lib/achievements';
import type { Goal, Transaction, Achievement } from '@/types/finance';

function monthsSorted(transactions: Transaction[]): string[] {
  const set = new Set(transactions.map((t) => t.date.slice(0, 7)));
  return Array.from(set).sort();
}

// Sincroniza conquistas com base nos dados reais e persiste as novas no Supabase.
export function useAchievementSync(
  goals: Goal[],
  transactions: Transaction[],
  achievements: Achievement[],
  onUnlocked: () => void,
) {
  const { user } = useAuth();
  const syncing = useRef(false);

  useEffect(() => {
    if (!user || syncing.current) return;

    const houseGoal = goals.find((g) => g.goal_type === 'house');
    const houseCurrent = houseGoal?.current_value ?? 0;

    const months = monthsSorted(transactions);
    const incomeByMonth = months.map((m) =>
      transactions.filter((t) => t.type === 'income' && t.date.startsWith(m)).reduce((s, t) => s + Number(t.amount), 0),
    );
    const expenseByMonth = months.map((m) =>
      transactions.filter((t) => t.type === 'expense' && t.date.startsWith(m)).reduce((s, t) => s + Number(t.amount), 0),
    );

    const monthlyIncomeMax = incomeByMonth.length ? Math.max(...incomeByMonth) : 0;
    const hadIncomeIncrease = incomeByMonth.length >= 2 && incomeByMonth.some((v, i) => i > 0 && v > incomeByMonth[i - 1]);
    const hadMonthWithinBudget = incomeByMonth.some((inc, i) => inc > 0 && expenseByMonth[i] <= inc);

    const unlockedCodes = evaluateAchievements({
      houseCurrent, monthlyIncomeMax, hadIncomeIncrease, hadMonthWithinBudget,
    });

    const alreadyUnlocked = new Set(achievements.map((a) => a.code));
    const newCodes = unlockedCodes.filter((c) => !alreadyUnlocked.has(c));

    if (newCodes.length > 0) {
      syncing.current = true;
      Promise.all(newCodes.map((code) => svc.unlockAchievement(user.id, code)))
        .then(() => onUnlocked())
        .finally(() => { syncing.current = false; });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, goals, transactions, achievements]);
}
