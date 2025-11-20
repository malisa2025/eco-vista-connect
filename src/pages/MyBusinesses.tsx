import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Eye, Star, Edit, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyBusinesses = () => {
  const navigate = useNavigate();

  // TODO: Fetch user's businesses
  const businesses: any[] = [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">My Businesses</h1>
              <p className="text-muted-foreground">Manage your business listings</p>
            </div>
            <Button onClick={() => navigate('/register-business')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          </div>

          {businesses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20">
                <Building2 className="h-20 w-20 text-muted-foreground/20 mb-4" />
                <h3 className="text-2xl font-bold mb-2">No businesses yet</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Start by registering your business to reach thousands of potential customers
                </p>
                <Button onClick={() => navigate('/register-business')}>
                  Register Your First Business
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {businesses.map((business: any) => (
                <Card key={business.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          {business.logo_url ? (
                            <img
                              src={business.logo_url}
                              alt={business.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-1">{business.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{business.category}</Badge>
                            <Badge variant="outline">{business.region}</Badge>
                            {business.is_verified && (
                              <Badge className="bg-primary/10 text-primary">Verified</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-2xl font-bold mb-1">
                          <Star className="h-5 w-5 fill-primary text-primary" />
                          {business.rating?.toFixed(1) || '0.0'}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {business.review_count || 0} reviews
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-2xl font-bold mb-1">
                          <Eye className="h-5 w-5" />
                          0
                        </div>
                        <p className="text-sm text-muted-foreground">views</p>
                      </div>
                      <div className="text-center">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/businesses/${business.id}`)}
                        >
                          View Page
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyBusinesses;
