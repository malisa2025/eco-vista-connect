import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Flag, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import FlaggedReviewCard from '@/components/admin/FlaggedReviewCard';

const ReviewModeration = () => {
  const queryClient = useQueryClient();

  const { data: flaggedReviews, isLoading } = useQuery({
    queryKey: ['flagged-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_flags')
        .select(`
          *,
          reviews (
            *,
            profiles:user_id (full_name, email),
            businesses (name)
          ),
          flagged_by_profile:flagged_by (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ flagId }: { flagId: string }) => {
      const { error } = await supabase
        .from('review_flags')
        .update({ status: 'resolved', reviewed_at: new Date().toISOString() })
        .eq('id', flagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-reviews'] });
      toast.success('Review approved successfully');
    },
    onError: () => {
      toast.error('Failed to approve review');
    }
  });

  const removeMutation = useMutation({
    mutationFn: async ({ flagId, reviewId, notes }: { flagId: string; reviewId: string; notes: string }) => {
      // Update flag status
      await supabase
        .from('review_flags')
        .update({ 
          status: 'confirmed', 
          reviewed_at: new Date().toISOString(),
          admin_notes: notes 
        })
        .eq('id', flagId);

      // Delete the review
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-reviews'] });
      toast.success('Review removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove review');
    }
  });

  const markFakeMutation = useMutation({
    mutationFn: async ({ flagId, reviewId, notes }: { flagId: string; reviewId: string; notes: string }) => {
      // Update flag status
      await supabase
        .from('review_flags')
        .update({ 
          status: 'confirmed', 
          reviewed_at: new Date().toISOString(),
          admin_notes: notes 
        })
        .eq('id', flagId);

      // Mark review as fake
      const { error } = await supabase
        .from('reviews')
        .update({ flagged_as_fake: true })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-reviews'] });
      toast.success('Review marked as fake');
    },
    onError: () => {
      toast.error('Failed to mark review');
    }
  });

  const pending = flaggedReviews?.filter(f => f.status === 'pending') || [];
  const resolved = flaggedReviews?.filter(f => f.status === 'resolved') || [];
  const confirmed = flaggedReviews?.filter(f => f.status === 'confirmed') || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">Review Moderation</h1>
            <p className="text-muted-foreground">Review and moderate flagged reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Flag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pending.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{resolved.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Removed/Flagged</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{confirmed.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full max-w-lg grid-cols-3 mb-8">
              <TabsTrigger value="pending">
                Pending <Badge className="ml-2">{pending.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="resolved">Approved</TabsTrigger>
              <TabsTrigger value="confirmed">Removed</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-6">
              {isLoading ? (
                <div className="text-center py-20">Loading...</div>
              ) : pending.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <Flag className="h-20 w-20 text-muted-foreground/20 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">No pending flags</h3>
                    <p className="text-muted-foreground">All flagged reviews have been reviewed</p>
                  </CardContent>
                </Card>
              ) : (
                pending.map(flag => (
                  <FlaggedReviewCard
                    key={flag.id}
                    flag={flag}
                    onApprove={approveMutation}
                    onRemove={removeMutation}
                    onMarkFake={markFakeMutation}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-6">
              {resolved.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <CheckCircle className="h-20 w-20 text-muted-foreground/20 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">No approved reviews</h3>
                    <p className="text-muted-foreground">Approved reviews will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                resolved.map(flag => (
                  <FlaggedReviewCard
                    key={flag.id}
                    flag={flag}
                    onApprove={approveMutation}
                    onRemove={removeMutation}
                    onMarkFake={markFakeMutation}
                    readonly
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-6">
              {confirmed.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <AlertTriangle className="h-20 w-20 text-muted-foreground/20 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">No removed reviews</h3>
                    <p className="text-muted-foreground">Removed reviews will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                confirmed.map(flag => (
                  <FlaggedReviewCard
                    key={flag.id}
                    flag={flag}
                    onApprove={approveMutation}
                    onRemove={removeMutation}
                    onMarkFake={markFakeMutation}
                    readonly
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReviewModeration;
