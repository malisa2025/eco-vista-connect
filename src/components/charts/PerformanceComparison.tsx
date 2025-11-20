import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceComparisonProps {
  data: Array<{
    name: string;
    ctr: number;
    impressions: number;
    clicks: number;
  }>;
}

const getCTRColor = (ctr: number) => {
  if (ctr < 1) return 'hsl(var(--destructive))'; // Red
  if (ctr < 3) return 'hsl(var(--warning))'; // Yellow
  return 'hsl(var(--success))'; // Green
};

export const PerformanceComparison = ({ data }: PerformanceComparisonProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ad Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'ctr') return [`${value.toFixed(2)}%`, 'CTR'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="ctr" name="CTR (%)">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getCTRColor(entry.ctr)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex gap-4 text-sm justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--destructive))' }} />
            <span>Below 1% (Needs Attention)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--warning))' }} />
            <span>1-3% (Average)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--success))' }} />
            <span>Above 3% (Excellent)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
