import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useMessageMutations } from '@/hooks/useMessages';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ContactBusinessButtonProps {
  businessId: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const ContactBusinessButton = ({ 
  businessId, 
  variant = 'default',
  size = 'default' 
}: ContactBusinessButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createConversation } = useMessageMutations();

  const handleContact = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      await createConversation.mutateAsync({
        businessId,
        userId: user.id,
      });
      navigate('/inbox');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Unable to contact business. Please try again.');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleContact}
      disabled={createConversation.isPending}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Contact Business
    </Button>
  );
};

export default ContactBusinessButton;
