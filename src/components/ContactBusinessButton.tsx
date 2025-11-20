import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useMessageMutations } from '@/hooks/useMessages';
import { useNavigate } from 'react-router-dom';

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

    const conversation = await createConversation.mutateAsync({
      businessId,
      userId: user.id,
    });

    navigate('/inbox');
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
