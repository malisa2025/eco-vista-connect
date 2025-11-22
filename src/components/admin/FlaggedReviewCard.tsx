import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, User, Calendar, Flag, CheckCircle, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReviewAuthenticityIndicator from '@/components/reviews/ReviewAuthenticityIndicator';

interface FlaggedReviewCardProps {
  flag: any;
  onApprove: any;
  onRemove: any;
  onMarkFake: any;
  readonly?: boolean;
}

const FlaggedReviewCard = ({ flag, onApprove, onRemove, onMarkFake, readonly }: FlaggedReviewCardProps) => {
  const review = flag.reviews;

  const handleApprove = () => {
    onApprove.mutate({ flagId: flag.id });
  };

  const handleRemove = () => {
    const notes = prompt('Reason for removing this review:');
    if (notes) {
      onRemove.mutate({ flagId: flag.id, reviewId: review.id, notes });
    }
  };

  const handleMarkFake = () => {
    const notes = prompt('Add notes about why this review is fake:');
    if (notes) {
      onMarkFake.mutate({ flagId: flag.id, reviewId: review.id, notes });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-2">{review.businesses?.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{flag.status}</Badge>
              {review.flagged_as_fake && (
                <Badge variant="destructive">Marked as Fake</Badge>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={`/businesses/${review.business_id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Business
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{review.profiles?.full_name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-1">{review.title}</h4>
            <p className="text-muted-foreground">{review.comment}</p>
          </div>

          {review.authenticity_score !== null && (
            <div>
              <ReviewAuthenticityIndicator 
                authenticityScore={review.authenticity_score}
                isVerifiedPurchase={review.is_verified_purchase}
                flaggedAsFake={review.flagged_as_fake}
              />
            </div>
          )}
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex items-start gap-2">
            <Flag className="h-4 w-4 text-red-600 mt-1 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Flagged by: {flag.flagged_by_profile?.full_name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">Reason:</span> {flag.reason}
              </p>
            </div>
          </div>

          {flag.admin_notes && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-1">Admin Notes:</p>
              <p className="text-sm text-muted-foreground">{flag.admin_notes}</p>
            </div>
          )}
        </div>

        {!readonly && flag.status === 'pending' && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleApprove}
              disabled={onApprove.isPending}
              variant="outline"
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Keep Review
            </Button>
            <Button
              onClick={handleMarkFake}
              disabled={onMarkFake.isPending}
              variant="secondary"
              className="flex-1"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Mark as Fake
            </Button>
            <Button
              onClick={handleRemove}
              disabled={onRemove.isPending}
              variant="destructive"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlaggedReviewCard;
