import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useAdVariants } from "@/hooks/useAdVariants";

interface CreateVariantDialogProps {
  advertisementId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateVariantDialog({ advertisementId, open, onOpenChange }: CreateVariantDialogProps) {
  const { createVariant } = useAdVariants(advertisementId);
  const [formData, setFormData] = useState({
    variant_name: "",
    title: "",
    description: "",
    image_url: "",
    cta_text: "",
    traffic_allocation: 50,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createVariant.mutateAsync({
      advertisement_id: advertisementId,
      ...formData,
    });
    onOpenChange(false);
    setFormData({
      variant_name: "",
      title: "",
      description: "",
      image_url: "",
      cta_text: "",
      traffic_allocation: 50,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Variant</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="variant_name">Variant Name</Label>
            <Input
              id="variant_name"
              value={formData.variant_name}
              onChange={(e) => setFormData({ ...formData, variant_name: e.target.value })}
              placeholder="e.g., Variant A, Blue Button, etc."
              required
            />
          </div>

          <div>
            <Label htmlFor="title">Ad Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Your compelling headline"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <div>
            <Label htmlFor="cta_text">Call-to-Action Text</Label>
            <Input
              id="cta_text"
              value={formData.cta_text}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              placeholder="e.g., Learn More, Get Started, etc."
            />
          </div>

          <div>
            <Label>Traffic Allocation: {formData.traffic_allocation}%</Label>
            <Slider
              value={[formData.traffic_allocation]}
              onValueChange={(value) => setFormData({ ...formData, traffic_allocation: value[0] })}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              What percentage of traffic should see this variant?
            </p>
          </div>

          {formData.image_url && (
            <div>
              <Label>Preview</Label>
              <div className="border rounded p-4 space-y-2">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <h4 className="font-semibold">{formData.title || "Your title here"}</h4>
                <p className="text-sm text-muted-foreground">
                  {formData.description || "Your description here"}
                </p>
                {formData.cta_text && (
                  <Button size="sm">{formData.cta_text}</Button>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createVariant.isPending}>
              {createVariant.isPending ? "Creating..." : "Create Variant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
