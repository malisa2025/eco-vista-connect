import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BusinessList from '@/components/BusinessList';
import { Heart } from 'lucide-react';

const Favorites = () => {
  const { user } = useAuth();
  const { data: favorites, isLoading } = useFavorites(user?.id);
  
  const businesses = favorites?.map(f => f.businesses).filter(Boolean) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-display font-bold">My Favorites</h1>
          </div>
          <p className="text-muted-foreground">
            Businesses you've saved for later
          </p>
        </div>

        <BusinessList businesses={businesses} isLoading={isLoading} />
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
