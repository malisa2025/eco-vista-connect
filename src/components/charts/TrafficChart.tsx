import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface TrafficChartProps {
  views: any[];
  applications: any[];
}

export const TrafficChart = ({ views, applications }: TrafficChartProps) => {
  // Group views by date
  const viewsByDate = views.reduce((acc: any, view) => {
    const date = new Date(view.viewed_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, views: 0, applications: 0 };
    }
    acc[date].views++;
    return acc;
  }, {});

  // Add applications to the same dates
  applications.forEach((app) => {
    const date = new Date(app.applied_at).toLocaleDateString();
    if (viewsByDate[date]) {
      viewsByDate[date].applications++;
    } else {
      viewsByDate[date] = { date, views: 0, applications: 1 };
    }
  });

  const chartData = Object.values(viewsByDate).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic & Applications Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="views"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Views"
            />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="Applications"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

interface ViewsBySourceProps {
  viewsBySource: Record<string, number>;
}

export const ViewsBySource = ({ viewsBySource }: ViewsBySourceProps) => {
  const data = Object.entries(viewsBySource).map(([source, count]) => ({
    name: source.charAt(0).toUpperCase() + source.slice(1),
    value: count,
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Views by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="hsl(var(--primary))"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
