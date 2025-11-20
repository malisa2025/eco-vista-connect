import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useIsFavorite, useFavoriteMutations } from '@/hooks/useFavorites';
import { useNavigate } from 'react-router-dom';

interface FavoriteButtonProps {
  businessId: string;
  variant?: 'default' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const FavoriteButton = ({ businessId, variant = 'ghost', size = 'icon' }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: isFavorite } = useIsFavorite(businessId, user?.id);
  const { addFavorite, removeFavorite } = useFavoriteMutations();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/auth');
      return;
    }

    if (isFavorite) {
      removeFavorite.mutate({ businessId, userId: user.id });
    } else {
      addFavorite.mutate({ businessId, userId: user.id });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={addFavorite.isPending || removeFavorite.isPending}
    >
      <Heart
        className={`h-5 w-5 ${isFavorite ? 'fill-primary text-primary' : ''}`}
      />
    </Button>
  );
};

export default FavoriteButton;
