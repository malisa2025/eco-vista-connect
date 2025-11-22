import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface FlagReviewButtonProps {
  reviewId: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
}

const FLAG_REASONS = [
  { value: 'spam', label: 'Spam or promotional content' },
  { value: 'fake', label: 'Fake or fraudulent review' },
  { value: 'offensive', label: 'Offensive or inappropriate language' },
  { value: 'competitor', label: 'Posted by competitor' },
  { value: 'duplicate', label: 'Duplicate review' },
  { value: 'other', label: 'Other reason' }
];

const FlagReviewButton = ({ 
  reviewId, 
  variant = 'ghost',
  size = 'sm'
}: FlagReviewButtonProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to flag reviews');
      return;
    }

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('review_flags').insert({
        review_id: reviewId,
        flagged_by: user.id,
        reason: `${FLAG_REASONS.find(r => r.value === reason)?.label}${details ? ': ' + details : ''}`
      });

      if (error) throw error;

      toast.success('Review flagged successfully. Our team will review it.');
      setOpen(false);
      setReason('');
      setDetails('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to flag review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Flag className="h-4 w-4" />
          <span className="ml-2">Flag</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Flag Review</DialogTitle>
          <DialogDescription>
            Help us maintain quality by reporting reviews that violate our community guidelines.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Reason for flagging</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {FLAG_REASONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value}
                    className="font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Flag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlagReviewButton;
