export function ProgressBar({
  percent,
  gradient = 'from-emerald-400 to-cyan-500',
  height = 'h-3',
}: {
  percent: number;
  gradient?: string;
  height?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className={`w-full ${height} rounded-full bg-slate-800 overflow-hidden`}>
      <div
        className={`${height} rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
