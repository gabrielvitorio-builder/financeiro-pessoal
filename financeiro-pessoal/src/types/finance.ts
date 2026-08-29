export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  is_reserve: boolean;
  is_available: boolean;
  created_at: string;
}

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  limit_amount: number | null;
  closing_day: number | null;
  due_day: number | null;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category_id: string | null;
  account_id: string | null;
  credit_card_id: string | null;
  date: string; // YYYY-MM-DD
  created_at: string;
}

export interface Installment {
  id: string;
  user_id: string;
  description: string;
  total_amount: number;
  installment_amount: number;
  total_installments: number;
  current_installment: number;
  credit_card_id: string | null;
  first_due_date: string;
  created_at: string;
}

export type AssetType = 'account' | 'reserve' | 'investment' | 'fgts' | 'vehicle' | 'property' | 'other';
export interface Asset {
  id: string;
  user_id: string;
  name: string;
  value: number;
  asset_type: AssetType;
  created_at: string;
}

export type LiabilityType = 'financing' | 'card' | 'loan' | 'other';
export interface Liability {
  id: string;
  user_id: string;
  name: string;
  value: number;
  liability_type: LiabilityType;
  created_at: string;
}

export type GoalType = 'house' | 'car' | 'income' | 'custom';
export interface Goal {
  id: string;
  user_id: string;
  name: string;
  goal_type: GoalType;
  target_value: number;
  current_value: number;
  deadline: string | null;
  priority: number;
  description: string | null;
  created_at: string;
}

export interface FinancialSettings {
  id: string;
  user_id: string;
  monthly_income_goal: number;
  house_goal_value: number;
  house_goal_months: number;
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
}

export interface MonthlyPlan {
  id: string;
  user_id: string;
  month: string; // 'YYYY-MM'
  planned_savings: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  code: string;
  unlocked_at: string;
}

export interface AchievementDef {
  code: string;
  emoji: string;
  label: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  houseCurrent: number;
  monthlyIncomeMax: number;
  hadIncomeIncrease: boolean;
  hadMonthWithinBudget: boolean;
}
