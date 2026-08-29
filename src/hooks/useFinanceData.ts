import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as svc from '@/services/financeService';
import type {
  Account, CreditCard, Category, Transaction, Installment,
  Asset, Liability, Goal, FinancialSettings, MonthlyPlan, Achievement,
} from '@/types/finance';

export function useFinanceData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<FinancialSettings | null>(null);
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyPlan[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const cats = await svc.ensureDefaultCategories(user.id);
      const [acc, cc, tx, inst, ast, liab, gl, st, mp, ach] = await Promise.all([
        svc.listAccounts(user.id),
        svc.listCreditCards(user.id),
        svc.listTransactions(user.id),
        svc.listInstallments(user.id),
        svc.listAssets(user.id),
        svc.listLiabilities(user.id),
        svc.listGoals(user.id),
        svc.getFinancialSettings(user.id),
        svc.listMonthlyPlan(user.id),
        svc.listAchievements(user.id),
      ]);
      setCategories(cats);
      setAccounts(acc);
      setCreditCards(cc);
      setTransactions(tx);
      setInstallments(inst);
      setAssets(ast);
      setLiabilities(liab);
      setGoals(gl);
      setSettings(st);
      setMonthlyPlan(mp);
      setAchievements(ach);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    loading, error, refresh,
    accounts, creditCards, categories, transactions, installments,
    assets, liabilities, goals, settings, monthlyPlan, achievements,
  };
}
