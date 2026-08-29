import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function FinancialInsights({ insights }: { insights: string[] }) {
  if (insights.length === 0) return null;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center">
          <Sparkles size={18} className="text-slate-950" />
        </div>
        <h3 className="text-white font-bold">Insights</h3>
      </div>
      <ul className="space-y-2.5">
        {insights.map((text, i) => (
          <li key={i} className="text-sm text-slate-300 bg-slate-800/50 rounded-xl px-3 py-2.5 leading-relaxed">
            {text}
          </li>
        ))}
      </ul>
    </Card>
  );
}
