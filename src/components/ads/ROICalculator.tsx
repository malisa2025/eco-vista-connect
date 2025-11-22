import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdROI } from "@/hooks/useAdROI";
import { ROITrendChart } from "./ROITrendChart";
import { DollarSign, TrendingUp, Target, Download } from "lucide-react";

interface ROICalculatorProps {
  advertisementId: string;
  totalSpend: number;
}

export function ROICalculator({ advertisementId, totalSpend }: ROICalculatorProps) {
  const [revenue, setRevenue] = useState<number>(0);
  const { roiData, historicalROI, isLoading } = useAdROI(advertisementId, 30);

  const cpa = roiData?.cpa || 0;
  const aov = roiData?.aov || 0;
  const conversions = roiData?.conversions || 0;
  const roi = revenue > 0 ? ((revenue - totalSpend) / totalSpend) * 100 : 0;
  const roas = totalSpend > 0 ? revenue / totalSpend : 0;
  const breakEvenRevenue = totalSpend;
  const profitMargin = revenue > 0 ? ((revenue - totalSpend) / revenue) * 100 : 0;

  const handleExport = () => {
    const data = {
      advertisement_id: advertisementId,
      total_spend: totalSpend,
      revenue: revenue,
      roi: roi.toFixed(2) + "%",
      roas: roas.toFixed(2),
      cpa: cpa.toFixed(2),
      conversions: conversions,
      break_even_revenue: breakEvenRevenue.toFixed(2),
      profit_margin: profitMargin.toFixed(2) + "%",
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roi-report-${advertisementId}.json`;
    a.click();
  };

  if (isLoading) {
    return <div>Loading ROI data...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ROI Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="spend">Total Ad Spend</Label>
              <div className="mt-1 text-2xl font-bold">
                GH₵{totalSpend.toFixed(2)}
              </div>
            </div>
            <div>
              <Label htmlFor="revenue">Total Revenue Generated</Label>
              <Input
                id="revenue"
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <TrendingUp className="mr-2 h-4 w-4" />
                ROI
              </div>
              <div className={`text-2xl font-bold ${roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                {roi.toFixed(1)}%
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <DollarSign className="mr-2 h-4 w-4" />
                ROAS
              </div>
              <div className="text-2xl font-bold">
                {roas.toFixed(2)}x
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Target className="mr-2 h-4 w-4" />
                CPA
              </div>
              <div className="text-2xl font-bold">
                GH₵{cpa.toFixed(2)}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <DollarSign className="mr-2 h-4 w-4" />
                AOV
              </div>
              <div className="text-2xl font-bold">
                GH₵{aov.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Break-Even Revenue</div>
              <div className="text-xl font-semibold">GH₵{breakEvenRevenue.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {revenue >= breakEvenRevenue ? "✓ Break-even achieved" : `Need GH₵${(breakEvenRevenue - revenue).toFixed(2)} more`}
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Profit Margin</div>
              <div className="text-xl font-semibold">{profitMargin.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                Profit: GH₵{(revenue - totalSpend).toFixed(2)}
              </div>
            </div>
          </div>

          <Button onClick={handleExport} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export ROI Report
          </Button>
        </CardContent>
      </Card>

      {historicalROI && historicalROI.length > 0 && (
        <ROITrendChart data={historicalROI} />
      )}
    </div>
  );
}
