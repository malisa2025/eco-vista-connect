import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCloudflareUpload } from '@/hooks/useCloudflareUpload';
import { FileUp, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationDocumentUploadProps {
  onDocumentsChange: (documents: Record<string, string>) => void;
  tier: string;
}

const VerificationDocumentUpload = ({ onDocumentsChange, tier }: VerificationDocumentUploadProps) => {
  const [documents, setDocuments] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const { uploadToCloudflare } = useCloudflareUpload();

  const requiredDocuments = {
    basic: ['business_registration'],
    government: ['business_registration', 'government_license'],
    premium: ['business_registration', 'tax_certificate', 'tax_clearance', 'operating_permit']
  };

  const documentLabels: Record<string, string> = {
    business_registration: 'Business Registration Certificate',
    government_license: 'Government Business License',
    tax_certificate: 'Tax Registration Certificate',
    tax_clearance: 'Latest Tax Clearance',
    operating_permit: 'Business Operating Permit'
  };

  const handleFileUpload = async (docType: string, file: File) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [docType]: true }));

    try {
      const result = await uploadToCloudflare(file, 'image');
      if (result?.url) {
        const newDocuments = { ...documents, [docType]: result.url };
        setDocuments(newDocuments);
        onDocumentsChange(newDocuments);
        toast.success('Document uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleRemoveDocument = (docType: string) => {
    const newDocuments = { ...documents };
    delete newDocuments[docType];
    setDocuments(newDocuments);
    onDocumentsChange(newDocuments);
  };

  const docsToShow = requiredDocuments[tier as keyof typeof requiredDocuments] || requiredDocuments.basic;

  return (
    <div className="space-y-4">
      {docsToShow.map((docType) => (
        <div key={docType} className="space-y-2">
          <Label>{documentLabels[docType]}</Label>
          {documents[docType] ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm flex-1">Document uploaded</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveDocument(docType)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(docType, file);
                }}
                disabled={uploading[docType]}
                className="flex-1"
              />
              {uploading[docType] && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileUp className="h-4 w-4 animate-pulse" />
                  Uploading...
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VerificationDocumentUpload;
