import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Mail, Eye, Clock, CheckCircle2 } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PAYSTACK_PUBLIC_KEY, PAYSTACK_CURRENCY } from '@/lib/paystack';

interface BoostJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
}

const BOOST_PRICE = 20; // GH₵20

const BoostJobDialog = ({ open, onOpenChange, jobId, jobTitle }: BoostJobDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const boostJob = useMutation({
    mutationFn: async (reference: string) => {
      const boostedUntil = new Date();
      boostedUntil.setDate(boostedUntil.getDate() + 7);

      const { error } = await supabase
        .from('jobs')
        .update({
          is_boosted: true,
          boosted_until: boostedUntil.toISOString(),
          boost_payment_reference: reference,
        })
        .eq('id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-jobs'] });
      toast.success('Job boosted successfully! Your posting is now featured.');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to boost job. Please contact support.');
    },
  });

  const config = {
    email: '',
    amount: BOOST_PRICE * 100, // Convert to pesewas
    currency: PAYSTACK_CURRENCY,
    publicKey: PAYSTACK_PUBLIC_KEY,
    reference: `boost_${jobId}_${Date.now()}`,
  };

  const onSuccess = (reference: any) => {
    setIsProcessing(true);
    boostJob.mutate(reference.reference);
  };

  const initializePayment = usePaystackPayment(config);

  const handleBoost = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to boost your job');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!profile?.email) {
      toast.error('Email not found. Please update your profile.');
      return;
    }

    config.email = profile.email;

    initializePayment({
      onSuccess,
      onClose: () => {
        if (!isProcessing) {
          onOpenChange(false);
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Boost Your Job Posting</DialogTitle>
          <DialogDescription>
            Get your job in front of more qualified candidates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold">What you get:</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Top 3 Placement</p>
                  <p className="text-sm text-muted-foreground">
                    Featured at the top of search results for 7 days
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Email to Matching Candidates</p>
                  <p className="text-sm text-muted-foreground">
                    Sent to all job seekers matching your requirements
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">3x More Views</p>
                  <p className="text-sm text-muted-foreground">
                    On average, boosted jobs get 3x more views
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">7 Days Duration</p>
                  <p className="text-sm text-muted-foreground">
                    Full week of premium visibility
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-center text-muted-foreground mb-2">
              Average results from boosted jobs
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">3x</p>
                <p className="text-xs text-muted-foreground">More Views</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">5x</p>
                <p className="text-xs text-muted-foreground">More Applications</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">2.5x</p>
                <p className="text-xs text-muted-foreground">Faster Fill</p>
              </div>
            </div>
          </div>

          {/* Job Info */}
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Boosting job:</p>
            <p className="font-semibold">{jobTitle}</p>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
            <div>
              <p className="font-semibold">Total Cost</p>
              <p className="text-sm text-muted-foreground">One-time payment</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">GH₵{BOOST_PRICE}</p>
              <p className="text-xs text-muted-foreground">for 7 days</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBoost}
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Boost Job
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoostJobDialog;
