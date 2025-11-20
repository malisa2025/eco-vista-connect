import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const CohortTable = () => {
  const { data: cohortData } = useQuery({
    queryKey: ['cohort-analysis'],
    queryFn: async () => {
      const { data: subscriptions } = await supabase
        .from('job_seeker_subscriptions')
        .select('start_date, end_date, status, cancelled_at')
        .order('start_date', { ascending: false });

      if (!subscriptions) return [];

      // Group by month
      const cohorts: any = {};

      subscriptions.forEach((sub) => {
        const cohortMonth = new Date(sub.start_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        });

        if (!cohorts[cohortMonth]) {
          cohorts[cohortMonth] = {
            total: 0,
            month1: 0,
            month2: 0,
            month3: 0,
            month6: 0,
          };
        }

        cohorts[cohortMonth].total++;

        const startDate = new Date(sub.start_date);
        const now = new Date();
        const monthsActive = Math.floor(
          (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );

        // Check if still active or when cancelled
        const isActive = sub.status === 'active' && new Date(sub.end_date) > now;
        const cancelledMonth = sub.cancelled_at
          ? Math.floor(
              (new Date(sub.cancelled_at).getTime() - startDate.getTime()) /
                (1000 * 60 * 60 * 24 * 30)
            )
          : Infinity;

        if (isActive || cancelledMonth >= 1) cohorts[cohortMonth].month1++;
        if (isActive || cancelledMonth >= 2) cohorts[cohortMonth].month2++;
        if (isActive || cancelledMonth >= 3) cohorts[cohortMonth].month3++;
        if (isActive || cancelledMonth >= 6) cohorts[cohortMonth].month6++;
      });

      return Object.entries(cohorts)
        .map(([month, data]: [string, any]) => ({
          month,
          total: data.total,
          month1: data.total > 0 ? ((data.month1 / data.total) * 100).toFixed(0) : 0,
          month2: data.total > 0 ? ((data.month2 / data.total) * 100).toFixed(0) : 0,
          month3: data.total > 0 ? ((data.month3 / data.total) * 100).toFixed(0) : 0,
          month6: data.total > 0 ? ((data.month6 / data.total) * 100).toFixed(0) : 0,
        }))
        .slice(0, 12);
    },
  });

  const getRetentionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Retention by Cohort</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cohort Month</TableHead>
              <TableHead className="text-right">New Subs</TableHead>
              <TableHead className="text-right">Month 1</TableHead>
              <TableHead className="text-right">Month 2</TableHead>
              <TableHead className="text-right">Month 3</TableHead>
              <TableHead className="text-right">Month 6</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cohortData?.map((cohort) => (
              <TableRow key={cohort.month}>
                <TableCell className="font-medium">{cohort.month}</TableCell>
                <TableCell className="text-right">{cohort.total}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={`px-2 py-1 rounded ${getRetentionColor(Number(cohort.month1))}`}
                  >
                    {cohort.month1}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`px-2 py-1 rounded ${getRetentionColor(Number(cohort.month2))}`}
                  >
                    {cohort.month2}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`px-2 py-1 rounded ${getRetentionColor(Number(cohort.month3))}`}
                  >
                    {cohort.month3}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`px-2 py-1 rounded ${getRetentionColor(Number(cohort.month6))}`}
                  >
                    {cohort.month6}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
