import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useBusinesses } from '@/hooks/useBusinesses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, Star } from 'lucide-react';

const AdminBusinesses = () => {
  const { data: businesses, isLoading } = useBusinesses({});

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              Businesses Management
            </h1>
            <p className="text-muted-foreground">View and manage all businesses</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Businesses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading businesses...</p>
              ) : businesses && businesses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businesses.map((business: any) => (
                      <TableRow key={business.id}>
                        <TableCell className="font-medium">{business.name}</TableCell>
                        <TableCell>{business.category}</TableCell>
                        <TableCell>{business.region}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            {business.rating?.toFixed(1) || '0.0'}
                          </div>
                        </TableCell>
                        <TableCell>{business.review_count || 0}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {business.is_verified && (
                              <Badge variant="default">Verified</Badge>
                            )}
                            {business.is_featured && (
                              <Badge variant="secondary">Featured</Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No businesses found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminBusinesses;
