import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTrackBusinessView = (businessId: string) => {
  useEffect(() => {
    const trackView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase
          .from('business_views')
          .insert({
            business_id: businessId,
            user_id: user?.id || null,
          });
      } catch (error) {
        // Silently fail - view tracking is not critical
      }
    };

    // Track view after a short delay to avoid tracking quick bounces
    const timer = setTimeout(trackView, 3000);

    return () => clearTimeout(timer);
  }, [businessId]);
};

export const useBusinessViewCount = (businessId: string) => {
  // This would require a view or function to count views
  // For now, return 0 as placeholder
  return { viewCount: 0 };
};
