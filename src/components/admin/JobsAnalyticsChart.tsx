import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface JobsAnalyticsChartProps {
  jobs: any[];
}

export const JobsAnalyticsChart = ({ jobs }: JobsAnalyticsChartProps) => {
  // Group jobs by posted date
  const jobsByDate = jobs.reduce((acc: any, job) => {
    const date = new Date(job.posted_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date]++;
    return acc;
  }, {});

  const dateData = Object.entries(jobsByDate)
    .map(([date, count]) => ({
      date,
      jobs: count,
    }))
    .slice(-30); // Last 30 days

  // Group by category
  const jobsByCategory = jobs.reduce((acc: any, job) => {
    if (!acc[job.category]) {
      acc[job.category] = { count: 0, applications: 0 };
    }
    acc[job.category].count++;
    acc[job.category].applications += job.application_count || 0;
    return acc;
  }, {});

  const categoryData = Object.entries(jobsByCategory)
    .map(([category, data]: [string, any]) => ({
      category,
      jobs: data.count,
      applications: data.applications,
    }))
    .sort((a, b) => b.applications - a.applications)
    .slice(0, 10);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Jobs Posted Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="jobs"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="applications" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
