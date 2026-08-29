import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, Target, BarChart3,
  LogOut, Plus, Home, Wallet, CreditCard, Landmark,
  CalendarRange, Calculator,
} from 'lucide-react';
import NewTransactionModal from '@/components/transactions/NewTransactionModal';

const sidebarItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/movimentacoes', label: 'Movimentações', icon: ArrowLeftRight, end: false },
  { to: '/contas', label: 'Contas', icon: Wallet, end: false },
  { to: '/cartoes', label: 'Cartões', icon: CreditCard, end: false },
  { to: '/metas', label: 'Metas', icon: Target, end: false },
  { to: '/patrimonio', label: 'Patrimônio', icon: Landmark, end: false },
  { to: '/plano-12-meses', label: 'Plano 12 meses', icon: CalendarRange, end: false },
  { to: '/simulador', label: 'Simulador', icon: Calculator, end: false },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3, end: false },
];

const mobileItems = [
  { to: '/', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/movimentacoes', label: 'Movim.', icon: ArrowLeftRight, end: false },
  { to: '/metas', label: 'Metas', icon: Target, end: false },
  { to: '/relatorios', label: 'Relat.', icon: BarChart3, end: false },
];

export default function AppLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 p-4 shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2 px-2 py-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
            <Home size={18} className="text-slate-950" />
          </div>
          <span className="font-bold">Financeiro Pessoal</span>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold py-2.5 transition-transform active:scale-[0.98]"
        >
          <Plus size={18} /> Nova movimentação
        </button>

        <nav className="flex-1 space-y-1">
          {sidebarItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
        >
          <LogOut size={18} /> Sair
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <Home size={16} className="text-slate-950" />
            </div>
            <span className="font-bold text-sm">Financeiro Pessoal</span>
          </div>
          <button onClick={handleSignOut} aria-label="Sair" className="text-slate-400 hover:text-rose-400">
            <LogOut size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 px-4 md:px-8 pt-6">
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 flex items-center justify-around py-2 z-40">
        {mobileItems.slice(0, 2).map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}

        <button
          onClick={() => setModalOpen(true)}
          aria-label="Nova movimentação"
          className="w-14 h-14 -mt-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
        >
          <Plus className="text-slate-950" size={26} />
        </button>

        {mobileItems.slice(2).map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      {modalOpen && <NewTransactionModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
