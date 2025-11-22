import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdBenchmarks } from "@/hooks/useAdBenchmarks";
import { BenchmarkGauge } from "./BenchmarkGauge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CompetitorBenchmarksProps {
  category: string;
  region?: string;
  currentCTR: number;
  currentCPC: number;
  currentConversionRate: number;
}

export function CompetitorBenchmarks({
  category,
  region,
  currentCTR,
  currentCPC,
  currentConversionRate,
}: CompetitorBenchmarksProps) {
  const { benchmarks, isLoading, getBenchmark } = useAdBenchmarks(category, region);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Industry Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const benchmark = getBenchmark(category, region);

  if (!benchmark) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Industry Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No benchmark data available for this category and region yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const ctrPercentile = calculatePercentile(currentCTR, benchmark.avg_ctr);
  const cpcPerformance = calculatePerformance(currentCPC, benchmark.avg_cost_per_click, true);
  const conversionPercentile = calculatePercentile(currentConversionRate, benchmark.avg_conversion_rate);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Industry Benchmarks - {category}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on {benchmark.sample_size?.toLocaleString()} ad campaigns
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Click-Through Rate</h4>
              <BenchmarkGauge
                value={ctrPercentile}
                label="Percentile"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your CTR:</span>
                <span className="font-semibold">{currentCTR.toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Industry Avg:</span>
                <span>{Number(benchmark.avg_ctr).toFixed(2)}%</span>
              </div>
              {renderTrendIcon(currentCTR, Number(benchmark.avg_ctr))}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Cost Per Click</h4>
              <div className="text-3xl font-bold">GH₵{currentCPC.toFixed(2)}</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Industry Avg:</span>
                <span>GH₵{Number(benchmark.avg_cost_per_click).toFixed(2)}</span>
              </div>
              {cpcPerformance === "better" && (
                <div className="flex items-center text-sm text-green-600">
                  <TrendingDown className="mr-1 h-4 w-4" />
                  Below average (good!)
                </div>
              )}
              {cpcPerformance === "worse" && (
                <div className="flex items-center text-sm text-red-600">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  Above average
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Conversion Rate</h4>
              <BenchmarkGauge
                value={conversionPercentile}
                label="Percentile"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Rate:</span>
                <span className="font-semibold">{currentConversionRate.toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Industry Avg:</span>
                <span>{Number(benchmark.avg_conversion_rate).toFixed(2)}%</span>
              </div>
              {renderTrendIcon(currentConversionRate, Number(benchmark.avg_conversion_rate))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculatePercentile(current: number, average: number): number {
  if (average === 0) return 50;
  const ratio = current / average;
  if (ratio >= 2) return 90;
  if (ratio >= 1.5) return 75;
  if (ratio >= 1.2) return 60;
  if (ratio >= 0.8) return 40;
  if (ratio >= 0.5) return 25;
  return 10;
}

function calculatePerformance(current: number, average: number, lowerIsBetter: boolean): "better" | "worse" | "same" {
  const diff = ((current - average) / average) * 100;
  if (Math.abs(diff) < 5) return "same";
  if (lowerIsBetter) {
    return diff < 0 ? "better" : "worse";
  }
  return diff > 0 ? "better" : "worse";
}

function renderTrendIcon(current: number, average: number) {
  const performance = calculatePerformance(current, average, false);
  
  if (performance === "better") {
    return (
      <div className="flex items-center text-sm text-green-600">
        <TrendingUp className="mr-1 h-4 w-4" />
        Above average
      </div>
    );
  }
  
  if (performance === "worse") {
    return (
      <div className="flex items-center text-sm text-red-600">
        <TrendingDown className="mr-1 h-4 w-4" />
        Below average
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Minus className="mr-1 h-4 w-4" />
      On par with average
    </div>
  );
}
