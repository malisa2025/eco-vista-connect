import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: {
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
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onHelpful?: () => void;
  isHelpful?: boolean;
}

const ReviewCard = ({ review, onEdit, onDelete, onHelpful, isHelpful }: ReviewCardProps) => {
  const { user, hasRole } = useAuth();
  const isOwner = user?.id === review.user_id;
  const canDelete = isOwner || hasRole('admin');

  const getInitials = () => {
    const name = review.profiles?.full_name || 'User';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={review.profiles?.avatar_url || ''} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">
                    {review.profiles?.full_name || 'Anonymous User'}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-1">
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

              {(isOwner || canDelete) && (
                <div className="flex gap-2">
                  {isOwner && onEdit && (
                    <Button variant="ghost" size="icon" onClick={onEdit}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && onDelete && (
                    <Button variant="ghost" size="icon" onClick={onDelete}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div>
              <h5 className="font-semibold mb-1">{review.title}</h5>
              <p className="text-muted-foreground">{review.comment}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isHelpful ? 'default' : 'outline'}
                size="sm"
                onClick={onHelpful}
                disabled={!user}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Helpful ({review.helpful_count})
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
