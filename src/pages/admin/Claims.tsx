import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAllClaims, useClaimMutations } from '@/hooks/useBusinessClaims';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardCheck, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminClaims = () => {
  const { data: claims, isLoading } = useAllClaims();
  const { updateClaimStatus } = useClaimMutations();
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const handleApprove = async () => {
    if (!selectedClaim) return;
    
    await updateClaimStatus.mutateAsync({
      claimId: selectedClaim.id,
      status: 'approved',
      adminNotes,
    });
    
    setSelectedClaim(null);
    setAdminNotes('');
  };

  const handleReject = async () => {
    if (!selectedClaim || !adminNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    await updateClaimStatus.mutateAsync({
      claimId: selectedClaim.id,
      status: 'rejected',
      adminNotes,
    });
    
    setSelectedClaim(null);
    setAdminNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-2">
              <ClipboardCheck className="h-8 w-8" />
              Business Claims Management
            </h1>
            <p className="text-muted-foreground">Review and manage business ownership claims</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Claims</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading claims...</p>
              ) : claims && claims.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Claimant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim: any) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-medium">
                          {claim.businesses?.name || claim.business_data?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {claim.profiles?.full_name || claim.profiles?.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {claim.claim_type === 'new_business' ? 'New' : 'Existing'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(claim.status)}>
                            {claim.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(claim.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {claim.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedClaim(claim)}
                            >
                              Review
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No claims found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Business Claim</DialogTitle>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Business Details</h3>
                <p><strong>Name:</strong> {selectedClaim.businesses?.name || selectedClaim.business_data?.name}</p>
                <p><strong>Type:</strong> {selectedClaim.claim_type === 'new_business' ? 'New Business' : 'Claim Existing'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Claimant Information</h3>
                <p><strong>Name:</strong> {selectedClaim.profiles?.full_name}</p>
                <p><strong>Email:</strong> {selectedClaim.profiles?.email}</p>
              </div>

              {selectedClaim.business_data && (
                <div>
                  <h3 className="font-semibold mb-2">Submitted Data</h3>
                  <pre className="text-sm bg-muted p-4 rounded overflow-auto max-h-48">
                    {JSON.stringify(selectedClaim.business_data, null, 2)}
                  </pre>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                <Textarea
                  placeholder="Add notes about this claim..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedClaim(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={updateClaimStatus.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={updateClaimStatus.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClaims;
