import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminVerification } from '@/hooks/useVerification';
import VerificationRequestCard from '@/components/admin/VerificationRequestCard';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const Verifications = () => {
  const { pendingRequests, approveRequest, rejectRequest, isLoading } = useAdminVerification();

  const pending = pendingRequests?.filter(r => r.status === 'pending') || [];
  const approved = pendingRequests?.filter(r => r.status === 'approved') || [];
  const rejected = pendingRequests?.filter(r => r.status === 'rejected') || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">Business Verifications</h1>
            <p className="text-muted-foreground">Review and approve verification requests</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pending.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{approved.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{rejected.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full max-w-lg grid-cols-3 mb-8">
              <TabsTrigger value="pending">
                Pending <Badge className="ml-2">{pending.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-6">
              {isLoading ? (
                <div className="text-center py-20">Loading...</div>
              ) : pending.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <Clock className="h-20 w-20 text-muted-foreground/20 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">No pending requests</h3>
                    <p className="text-muted-foreground">All verification requests have been reviewed</p>
                  </CardContent>
                </Card>
              ) : (
                pending.map(request => (
                  <VerificationRequestCard
                    key={request.id}
                    request={request}
                    onApprove={approveRequest}
                    onReject={rejectRequest}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-6">
              {approved.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <CheckCircle className="h-20 w-20 text-muted-foreground/20 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">No approved requests</h3>
                    <p className="text-muted-foreground">Approved verification requests will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                approved.map(request => (
                  <VerificationRequestCard
                    key={request.id}
                    request={request}
                    onApprove={approveRequest}
                    onReject={rejectRequest}
                    readonly
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-6">
              {rejected.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <XCircle className="h-20 w-20 text-muted-foreground/20 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">No rejected requests</h3>
                    <p className="text-muted-foreground">Rejected verification requests will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                rejected.map(request => (
                  <VerificationRequestCard
                    key={request.id}
                    request={request}
                    onApprove={approveRequest}
                    onReject={rejectRequest}
                    readonly
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Verifications;
