import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImageUploader } from '@/components/business/ImageUploader';
import { usePartnerMutations } from '@/hooks/usePartners';

interface CreatePartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePartnerDialog = ({ open, onOpenChange }: CreatePartnerDialogProps) => {
  const { createPartner } = usePartnerMutations();
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.logo_url) {
      alert('Name and logo are required');
      return;
    }

    createPartner.mutate(formData, {
      onSuccess: () => {
        setFormData({ name: '', logo_url: '', website_url: '', is_active: true });
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Partner</DialogTitle>
          <DialogDescription>Add a new partner organization to display on the homepage</DialogDescription>
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
            <Button type="submit" disabled={createPartner.isPending}>
              {createPartner.isPending ? 'Adding...' : 'Add Partner'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
