import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface ROITrendChartProps {
  data: Array<{
    date: string;
    roi_percentage: number | null;
    total_spend: number | null;
    total_revenue: number | null;
  }>;
}

export function ROITrendChart({ data }: ROITrendChartProps) {
  const chartData = data.map((item) => ({
    date: format(new Date(item.date), "MMM dd"),
    roi: Number(item.roi_percentage) || 0,
    spend: Number(item.total_spend) || 0,
    revenue: Number(item.total_revenue) || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>ROI Trend (30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
              }}
              formatter={(value: number, name: string) => {
                if (name === "roi") return [`${value.toFixed(1)}%`, "ROI"];
                return [`GH₵${value.toFixed(2)}`, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="roi"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#roiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 border rounded-lg">
            <div className="text-sm text-muted-foreground">Total Spend</div>
            <div className="text-xl font-bold">
              GH₵{chartData.reduce((sum, item) => sum + item.spend, 0).toFixed(2)}
            </div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-xl font-bold">
              GH₵{chartData.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
