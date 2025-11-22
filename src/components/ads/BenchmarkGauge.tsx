interface BenchmarkGaugeProps {
  value: number; // 0-100 percentile
  label: string;
}

export function BenchmarkGauge({ value, label }: BenchmarkGaugeProps) {
  const getColor = (val: number) => {
    if (val >= 75) return "hsl(var(--primary))";
    if (val >= 50) return "hsl(var(--secondary))";
    if (val >= 25) return "hsl(var(--accent))";
    return "hsl(var(--muted-foreground))";
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const color = getColor(value);

  const getRank = (val: number) => {
    if (val >= 90) return "Top 10%";
    if (val >= 75) return "Top 25%";
    if (val >= 50) return "Top 50%";
    if (val >= 25) return "Bottom 50%";
    return "Bottom 25%";
  };

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold" style={{ color }}>
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{getRank(value)}</div>
      </div>
    </div>
  );
}
