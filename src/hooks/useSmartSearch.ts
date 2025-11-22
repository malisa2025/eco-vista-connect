import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SearchSuggestion {
  suggestions: string[];
  cached: boolean;
}

export const useSmartSearch = (query: string) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-search-suggestions', {
          body: { query, userId: user?.id }
        });

        if (error) throw error;
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, user?.id]);

  const trackSearch = async (searchQuery: string, clickedBusinessId?: string) => {
    if (!user) return;

    try {
      await supabase.from('search_history').insert({
        user_id: user.id,
        search_query: searchQuery,
        clicked_business_id: clickedBusinessId
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  };

  return { suggestions, loading, trackSearch };
};
