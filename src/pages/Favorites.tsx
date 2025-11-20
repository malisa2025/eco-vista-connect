import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BusinessList from '@/components/BusinessList';
import { Heart } from 'lucide-react';

const Favorites = () => {
  // TODO: Fetch user's favorite businesses
  const businesses: any[] = [];
  const isLoading = false;

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
