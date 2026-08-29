import { Card } from '@/components/ui/Card';
import { ACHIEVEMENT_DEFS } from '@/lib/achievements';
import { formatDateBR } from '@/lib/format';
import type { Achievement } from '@/types/finance';

export function AchievementsGrid({ achievements }: { achievements: Achievement[] }) {
  const unlockedMap = new Map(achievements.map((a) => [a.code, a.unlocked_at]));

  return (
    <Card>
      <h3 className="text-white font-bold mb-4">Conquistas</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACHIEVEMENT_DEFS.map((def) => {
          const unlockedAt = unlockedMap.get(def.code);
          const unlocked = Boolean(unlockedAt);
          return (
            <div
              key={def.code}
              className={`flex flex-col items-center text-center gap-1 rounded-xl px-3 py-4 border transition-colors ${
                unlocked ? 'bg-emerald-950/40 border-emerald-900' : 'bg-slate-800/40 border-slate-800'
              }`}
            >
              <span className={`text-2xl ${unlocked ? '' : 'grayscale opacity-30'}`}>{def.emoji}</span>
              <span className={`text-xs font-medium ${unlocked ? 'text-white' : 'text-slate-500'}`}>{def.label}</span>
              {unlocked && unlockedAt && (
                <span className="text-[10px] text-emerald-400">{formatDateBR(unlockedAt.slice(0, 10))}</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
