import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, FileText, Calendar, User, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface VerificationRequestCardProps {
  request: any;
  onApprove: any;
  onReject: any;
  readonly?: boolean;
}

const VerificationRequestCard = ({ request, onApprove, onReject, readonly }: VerificationRequestCardProps) => {
  const [selectedTier, setSelectedTier] = useState(request.tier_requested);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = () => {
    onApprove.mutate({
      requestId: request.id,
      businessId: request.business_id,
      tier: selectedTier
    });
  };

  const handleReject = () => {
    if (rejectionReason) {
      onReject.mutate({
        requestId: request.id,
        reason: rejectionReason
      });
    }
  };

  const tierColors = {
    basic: 'bg-blue-500/10 text-blue-600',
    government: 'bg-purple-500/10 text-purple-600',
    premium: 'bg-amber-500/10 text-amber-600'
  };

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-600',
    approved: 'bg-green-500/10 text-green-600',
    rejected: 'bg-red-500/10 text-red-600'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle className="text-xl">{request.businesses?.name || 'Unknown Business'}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={tierColors[request.tier_requested as keyof typeof tierColors]}>
                  {request.tier_requested}
                </Badge>
                <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                  {request.status}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={`/businesses/${request.business_id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Business
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Requested by</span>
            </div>
            <p className="font-medium">{request.profiles?.full_name || 'Unknown User'}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Submitted</span>
            </div>
            <p className="font-medium">
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {request.documents && Object.keys(request.documents).length > 0 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Uploaded Documents
            </Label>
            <div className="grid md:grid-cols-2 gap-2">
              {Object.entries(request.documents).map(([key, url]: [string, any]) => (
                <Button key={key} variant="outline" size="sm" asChild className="justify-start">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}

        {request.admin_notes && (
          <div className="space-y-2">
            <Label>Admin Notes</Label>
            <div className="p-3 bg-muted rounded-md text-sm">
              {request.admin_notes}
            </div>
          </div>
        )}

        {!readonly && request.status === 'pending' && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Verification Tier</Label>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admin Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this verification..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={onApprove.isPending}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const reason = prompt('Reason for rejection:');
                  if (reason) {
                    setRejectionReason(reason);
                    handleReject();
                  }
                }}
                disabled={onReject.isPending}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationRequestCard;
