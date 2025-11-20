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
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RevenueChartProps {
  timeRange: string;
}

export const RevenueChart = ({ timeRange }: RevenueChartProps) => {
  const { data: revenueData } = useQuery({
    queryKey: ['revenue-chart', timeRange],
    queryFn: async () => {
      const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: payments } = await supabase
        .from('subscription_payments')
        .select('paid_at, amount, status')
        .gte('paid_at', startDate.toISOString())
        .eq('status', 'success')
        .order('paid_at', { ascending: true });

      const { data: subscriptions } = await supabase
        .from('job_seeker_subscriptions')
        .select('start_date, cancelled_at, status')
        .gte('start_date', startDate.toISOString());

      // Group by date
      const dailyData: any = {};

      payments?.forEach((payment) => {
        const date = new Date(payment.paid_at).toLocaleDateString();
        if (!dailyData[date]) {
          dailyData[date] = { revenue: 0, newSubs: 0, cancellations: 0 };
        }
        dailyData[date].revenue += Number(payment.amount);
      });

      subscriptions?.forEach((sub) => {
        const startDate = new Date(sub.start_date).toLocaleDateString();
        if (!dailyData[startDate]) {
          dailyData[startDate] = { revenue: 0, newSubs: 0, cancellations: 0 };
        }
        dailyData[startDate].newSubs++;

        if (sub.cancelled_at) {
          const cancelDate = new Date(sub.cancelled_at).toLocaleDateString();
          if (!dailyData[cancelDate]) {
            dailyData[cancelDate] = { revenue: 0, newSubs: 0, cancellations: 0 };
          }
          dailyData[cancelDate].cancellations++;
        }
      });

      return Object.entries(dailyData)
        .map(([date, data]: [string, any]) => ({
          date,
          revenue: data.revenue,
          newSubs: data.newSubs,
          cancellations: data.cancellations,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue & Subscription Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Revenue (GHS)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="newSubs"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="New Subscriptions"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cancellations"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              name="Cancellations"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
