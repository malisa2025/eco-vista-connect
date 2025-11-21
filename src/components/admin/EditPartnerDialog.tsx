import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImageUploader } from '@/components/business/ImageUploader';
import { usePartnerMutations, Partner } from '@/hooks/usePartners';

interface EditPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: Partner;
}

export const EditPartnerDialog = ({ open, onOpenChange, partner }: EditPartnerDialogProps) => {
  const { updatePartner } = usePartnerMutations();
  const [formData, setFormData] = useState({
    name: partner.name,
    logo_url: partner.logo_url,
    website_url: partner.website_url || '',
    is_active: partner.is_active,
  });

  useEffect(() => {
    setFormData({
      name: partner.name,
      logo_url: partner.logo_url,
      website_url: partner.website_url || '',
      is_active: partner.is_active,
    });
  }, [partner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.logo_url) {
      alert('Name and logo are required');
      return;
    }

    updatePartner.mutate(
      {
        id: partner.id,
        updates: {
          name: formData.name,
          logo_url: formData.logo_url,
          website_url: formData.website_url || undefined,
          is_active: formData.is_active,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Partner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Partner Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Ghana Chamber of Commerce"
            />
          </div>

          <div>
            <Label>Website URL (optional)</Label>
            <Input
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <ImageUploader
            label="Partner Logo *"
            aspectRatio="square"
            currentImageUrl={formData.logo_url}
            onUploadComplete={(url) => setFormData({ ...formData, logo_url: url })}
          />

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label>Active (visible on homepage)</Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatePartner.isPending}>
              {updatePartner.isPending ? 'Updating...' : 'Update Partner'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
