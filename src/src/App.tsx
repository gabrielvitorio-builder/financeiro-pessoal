import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage from '@/pages/DashboardPage';
import TransactionsPage from '@/pages/TransactionsPage';
import AccountsPage from '@/pages/AccountsPage';
import CreditCardsPage from '@/pages/CreditCardsPage';
import GoalsPage from '@/pages/GoalsPage';
import AssetsPage from '@/pages/AssetsPage';
import ReportsPage from '@/pages/ReportsPage';
import SimulatorPage from '@/pages/SimulatorPage';
import TwelveMonthPlanPage from '@/pages/TwelveMonthPlanPage';
import AppLayout from '@/layouts/AppLayout';
import { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400 animate-pulse">Carregando…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="movimentacoes" element={<TransactionsPage />} />
            <Route path="contas" element={<AccountsPage />} />
            <Route path="cartoes" element={<CreditCardsPage />} />
            <Route path="metas" element={<GoalsPage />} />
            <Route path="patrimonio" element={<AssetsPage />} />
            <Route path="plano-12-meses" element={<TwelveMonthPlanPage />} />
            <Route path="simulador" element={<SimulatorPage />} />
            <Route path="relatorios" element={<ReportsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
