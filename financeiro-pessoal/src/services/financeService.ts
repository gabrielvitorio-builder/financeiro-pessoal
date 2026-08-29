import { supabase } from '@/lib/supabase';
import type {
  Account, CreditCard, Category, Transaction, Installment,
  Asset, Liability, Goal, FinancialSettings, TransactionType,
  MonthlyPlan, Achievement,
} from '@/types/finance';

// ---------- Accounts ----------
export async function listAccounts(userId: string): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts').select('*').eq('user_id', userId).order('created_at');
  if (error) throw error;
  return data as Account[];
}

export async function upsertAccount(userId: string, account: Partial<Account> & { id?: string }) {
  const payload = { ...account, user_id: userId };
  const { data, error } = await supabase.from('accounts').upsert(payload).select().single();
  if (error) throw error;
  return data as Account;
}

export async function deleteAccount(id: string) {
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Credit Cards ----------
export async function listCreditCards(userId: string): Promise<CreditCard[]> {
  const { data, error } = await supabase
    .from('credit_cards').select('*').eq('user_id', userId).order('created_at');
  if (error) throw error;
  return data as CreditCard[];
}

export async function upsertCreditCard(userId: string, card: Partial<CreditCard> & { id?: string }) {
  const payload = { ...card, user_id: userId };
  const { data, error } = await supabase.from('credit_cards').upsert(payload).select().single();
  if (error) throw error;
  return data as CreditCard;
}

export async function deleteCreditCard(id: string) {
  const { error } = await supabase.from('credit_cards').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Categories ----------
export async function listCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories').select('*').eq('user_id', userId).order('name');
  if (error) throw error;
  return data as Category[];
}

export async function upsertCategory(userId: string, category: Partial<Category> & { id?: string }) {
  const payload = { ...category, user_id: userId };
  const { data, error } = await supabase.from('categories').upsert(payload).select().single();
  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function ensureDefaultCategories(userId: string) {
  const existing = await listCategories(userId);
  if (existing.length > 0) return existing;

  const defaults: Array<{ name: string; type: TransactionType; icon: string; color: string }> = [
    { name: 'Salário', type: 'income', icon: '💼', color: '#22c55e' },
    { name: 'Freelance', type: 'income', icon: '💻', color: '#10b981' },
    { name: 'Segundo trabalho', type: 'income', icon: '🧾', color: '#14b8a6' },
    { name: 'Rendimentos', type: 'income', icon: '📈', color: '#06b6d4' },
    { name: 'Outros', type: 'income', icon: '➕', color: '#84cc16' },
    { name: 'Moradia', type: 'expense', icon: '🏠', color: '#f97316' },
    { name: 'Alimentação', type: 'expense', icon: '🍽️', color: '#ef4444' },
    { name: 'Transporte', type: 'expense', icon: '🚌', color: '#eab308' },
    { name: 'Carro', type: 'expense', icon: '🚗', color: '#f59e0b' },
    { name: 'Assinaturas', type: 'expense', icon: '📺', color: '#a855f7' },
    { name: 'Saúde', type: 'expense', icon: '💊', color: '#ec4899' },
    { name: 'Educação', type: 'expense', icon: '📚', color: '#6366f1' },
    { name: 'Lazer', type: 'expense', icon: '🎉', color: '#8b5cf6' },
    { name: 'Compras', type: 'expense', icon: '🛍️', color: '#d946ef' },
    { name: 'Outros', type: 'expense', icon: '📦', color: '#64748b' },
  ];

  const payload = defaults.map((d) => ({ ...d, user_id: userId }));
  const { data, error } = await supabase.from('categories').insert(payload).select();
  if (error) throw error;
  return data as Category[];
}

// ---------- Transactions ----------
export async function listTransactions(userId: string, limit = 500): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions').select('*').eq('user_id', userId)
    .order('date', { ascending: false }).limit(limit);
  if (error) throw error;
  return data as Transaction[];
}

export async function createTransaction(userId: string, tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('transactions').insert({ ...tx, user_id: userId }).select().single();
  if (error) throw error;

  if (tx.account_id) {
    const delta = tx.type === 'income' ? tx.amount : tx.type === 'expense' ? -tx.amount : 0;
    if (delta !== 0) {
      const { data: acc } = await supabase.from('accounts').select('balance').eq('id', tx.account_id).single();
      if (acc) {
        await supabase.from('accounts')
          .update({ balance: Number(acc.balance) + delta })
          .eq('id', tx.account_id);
      }
    }
  }

  return data as Transaction;
}

export async function updateTransaction(id: string, patch: Partial<Transaction>) {
  const { data, error } = await supabase.from('transactions').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Transaction;
}

export async function deleteTransaction(tx: Transaction) {
  const { error } = await supabase.from('transactions').delete().eq('id', tx.id);
  if (error) throw error;

  if (tx.account_id) {
    const delta = tx.type === 'income' ? -tx.amount : tx.type === 'expense' ? tx.amount : 0;
    if (delta !== 0) {
      const { data: acc } = await supabase.from('accounts').select('balance').eq('id', tx.account_id).single();
      if (acc) {
        await supabase.from('accounts')
          .update({ balance: Number(acc.balance) + delta })
          .eq('id', tx.account_id);
      }
    }
  }
}

// ---------- Installments ----------
export async function listInstallments(userId: string): Promise<Installment[]> {
  const { data, error } = await supabase
    .from('installments').select('*').eq('user_id', userId).order('first_due_date');
  if (error) throw error;
  return data as Installment[];
}

export async function upsertInstallment(userId: string, item: Partial<Installment> & { id?: string }) {
  const payload = { ...item, user_id: userId };
  const { data, error } = await supabase.from('installments').upsert(payload).select().single();
  if (error) throw error;
  return data as Installment;
}

export async function deleteInstallment(id: string) {
  const { error } = await supabase.from('installments').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Assets & Liabilities ----------
export async function listAssets(userId: string): Promise<Asset[]> {
  const { data, error } = await supabase.from('assets').select('*').eq('user_id', userId).order('created_at');
  if (error) throw error;
  return data as Asset[];
}

export async function upsertAsset(userId: string, asset: Partial<Asset> & { id?: string }) {
  const payload = { ...asset, user_id: userId };
  const { data, error } = await supabase.from('assets').upsert(payload).select().single();
  if (error) throw error;
  return data as Asset;
}

export async function deleteAsset(id: string) {
  const { error } = await supabase.from('assets').delete().eq('id', id);
  if (error) throw error;
}

export async function listLiabilities(userId: string): Promise<Liability[]> {
  const { data, error } = await supabase.from('liabilities').select('*').eq('user_id', userId).order('created_at');
  if (error) throw error;
  return data as Liability[];
}

export async function upsertLiability(userId: string, liability: Partial<Liability> & { id?: string }) {
  const payload = { ...liability, user_id: userId };
  const { data, error } = await supabase.from('liabilities').upsert(payload).select().single();
  if (error) throw error;
  return data as Liability;
}

export async function deleteLiability(id: string) {
  const { error } = await supabase.from('liabilities').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Goals ----------
export async function listGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId).order('priority');
  if (error) throw error;
  return data as Goal[];
}

export async function upsertGoal(userId: string, goal: Partial<Goal> & { id?: string }) {
  const payload = { ...goal, user_id: userId };
  const { data, error } = await supabase.from('goals').upsert(payload).select().single();
  if (error) throw error;
  return data as Goal;
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Financial Settings ----------
export async function getFinancialSettings(userId: string): Promise<FinancialSettings | null> {
  const { data, error } = await supabase
    .from('financial_settings').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data as FinancialSettings | null;
}

export async function upsertFinancialSettings(userId: string, patch: Partial<FinancialSettings>) {
  const existing = await getFinancialSettings(userId);
  const payload = existing ? { ...patch, id: existing.id, user_id: userId } : { ...patch, user_id: userId };
  const { data, error } = await supabase.from('financial_settings').upsert(payload).select().single();
  if (error) throw error;
  return data as FinancialSettings;
}

// ---------- Monthly Plan ----------
export async function listMonthlyPlan(userId: string): Promise<MonthlyPlan[]> {
  const { data, error } = await supabase
    .from('monthly_plan').select('*').eq('user_id', userId).order('month');
  if (error) throw error;
  return data as MonthlyPlan[];
}

export async function upsertMonthlyPlan(userId: string, month: string, plannedSavings: number) {
  const { data, error } = await supabase
    .from('monthly_plan')
    .upsert({ user_id: userId, month, planned_savings: plannedSavings }, { onConflict: 'user_id,month' })
    .select().single();
  if (error) throw error;
  return data as MonthlyPlan;
}

// ---------- Achievements ----------
export async function listAchievements(userId: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements').select('*').eq('user_id', userId).order('unlocked_at');
  if (error) throw error;
  return data as Achievement[];
}

export async function unlockAchievement(userId: string, code: string) {
  const { error } = await supabase
    .from('achievements')
    .upsert({ user_id: userId, code }, { onConflict: 'user_id,code', ignoreDuplicates: true });
  if (error) throw error;
}

// ---------- Onboarding helpers (evita duplicação) ----------
export async function ensureAccount(userId: string, name: string, balance: number, isReserve: boolean, isAvailable: boolean) {
  const existing = await listAccounts(userId);
  const found = existing.find((a) => a.name.toLowerCase() === name.toLowerCase());
  if (found) return found;
  return upsertAccount(userId, { name, balance, is_reserve: isReserve, is_available: isAvailable });
}

export async function ensureAsset(userId: string, name: string, value: number, assetType: Asset['asset_type']) {
  const existing = await listAssets(userId);
  const found = existing.find((a) => a.name.toLowerCase() === name.toLowerCase());
  if (found) return found;
  return upsertAsset(userId, { name, value, asset_type: assetType });
}

export async function ensureLiability(userId: string, name: string, value: number, liabilityType: Liability['liability_type']) {
  const existing = await listLiabilities(userId);
  const found = existing.find((l) => l.name.toLowerCase() === name.toLowerCase());
  if (found) return found;
  return upsertLiability(userId, { name, value, liability_type: liabilityType });
}

export async function ensureGoal(userId: string, goal: Omit<Goal, 'id' | 'user_id' | 'created_at'>) {
  const existing = await listGoals(userId);
  const found = existing.find((g) => g.goal_type === goal.goal_type && g.name.toLowerCase() === goal.name.toLowerCase());
  if (found) return found;
  return upsertGoal(userId, goal);
}
