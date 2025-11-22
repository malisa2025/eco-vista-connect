import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck } from 'lucide-react';
import VerificationDocumentUpload from './VerificationDocumentUpload';
import { useVerification } from '@/hooks/useVerification';
import { toast } from 'sonner';

interface RequestVerificationDialogProps {
  businessId: string;
}

const RequestVerificationDialog = ({ businessId }: RequestVerificationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'government' | 'premium'>('basic');
  const [documents, setDocuments] = useState<Record<string, string>>({});
  const { submitRequest } = useVerification(businessId);

  const handleSubmit = async () => {
    if (Object.keys(documents).length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    // Convert documents object to array format expected by the hook
    const documentsArray = Object.entries(documents).map(([name, url]) => ({
      name,
      url,
      type: url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'
    }));

    try {
      await submitRequest.mutateAsync({
        businessId,
        tier: selectedTier,
        documents: documentsArray
      });
      setOpen(false);
      setDocuments({});
      setSelectedTier('basic');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ShieldCheck className="h-4 w-4 mr-2" />
          Request Verification
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Business Verification</DialogTitle>
          <DialogDescription>
            Submit documents to verify your business and increase trust with customers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Verification Tier</Label>
            <Select value={selectedTier} onValueChange={(value) => setSelectedTier(value as 'basic' | 'government' | 'premium')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">
                  <div className="space-y-1">
                    <div className="font-medium">Basic Verification</div>
                    <div className="text-xs text-muted-foreground">Business registration documents</div>
                  </div>
                </SelectItem>
                <SelectItem value="government">
                  <div className="space-y-1">
                    <div className="font-medium">Government Verification</div>
                    <div className="text-xs text-muted-foreground">Official government business license</div>
                  </div>
                </SelectItem>
                <SelectItem value="premium">
                  <div className="space-y-1">
                    <div className="font-medium">Premium Verification</div>
                    <div className="text-xs text-muted-foreground">Complete business credentials + tax compliance</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Required Documents</Label>
            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <p className="font-medium">Please upload the following:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Business Registration Certificate</li>
                {selectedTier === 'government' && <li>Government Business License</li>}
                {selectedTier === 'premium' && (
                  <>
                    <li>Tax Registration Certificate</li>
                    <li>Latest Tax Clearance</li>
                    <li>Business Operating Permit</li>
                  </>
                )}
              </ul>
            </div>

            <VerificationDocumentUpload
              onDocumentsChange={setDocuments}
              tier={selectedTier}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={submitRequest.isPending || Object.keys(documents).length === 0}
              className="flex-1"
            >
              {submitRequest.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestVerificationDialog;
