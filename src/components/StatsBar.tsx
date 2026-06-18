'use client';

interface StatsPill {
  label: string;
  value: string | number;
}

interface StatsBarProps {
  stats: StatsPill[];
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-bg-card border border-border rounded-lg p-4 text-center"
        >
          <p className="text-xs text-text-muted mb-2">{stat.label}</p>
          <p className="text-2xl font-bold text-accent">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
