import { useState } from 'react';
import ReviewCard from './ReviewCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  isLoading?: boolean;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  onHelpful?: (reviewId: string) => void;
  helpfulReviewIds?: string[];
}

const ReviewsList = ({
  reviews,
  isLoading,
  onEdit,
  onDelete,
  onHelpful,
  helpfulReviewIds = [],
}: ReviewsListProps) => {
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'highest':
        return b.rating - a.rating;
      case 'helpful':
        return b.helpful_count - a.helpful_count;
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
        <p className="text-muted-foreground">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
        </h3>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="highest">Highest Rated</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onEdit={onEdit ? () => onEdit(review.id) : undefined}
            onDelete={onDelete ? () => onDelete(review.id) : undefined}
            onHelpful={onHelpful ? () => onHelpful(review.id) : undefined}
            isHelpful={helpfulReviewIds.includes(review.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
