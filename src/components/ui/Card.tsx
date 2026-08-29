import { ReactNode } from 'react';

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur p-5 shadow-lg shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  subValue,
  accent = 'from-emerald-400 to-cyan-500',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  subValue?: string;
  accent?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-xl`}
      />
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      {subValue && <div className="text-xs text-slate-500 mt-1">{subValue}</div>}
    </Card>
  );
}
