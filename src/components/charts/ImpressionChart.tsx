import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ImpressionChartProps {
  data: Array<{
    date: string;
    impressions: number;
    clicks: number;
  }>;
}

export const ImpressionChart = ({ data }: ImpressionChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Impressions & Clicks Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="impressions" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Impressions"
            />
            <Line 
              type="monotone" 
              dataKey="clicks" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              name="Clicks"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
