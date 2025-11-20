import { useState } from 'react';
import { Plus, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageUploader } from './ImageUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface GalleryManagerProps {
  images: string[];
  heroImage?: string;
  onImagesChange: (images: string[]) => void;
  onHeroImageChange: (url: string) => void;
  maxImages?: number;
}

export const GalleryManager = ({
  images = [],
  heroImage,
  onImagesChange,
  onHeroImageChange,
  maxImages = 10,
}: GalleryManagerProps) => {
  const [isAddingImage, setIsAddingImage] = useState(false);

  const handleAddImage = (url: string) => {
    if (url && images.length < maxImages) {
      onImagesChange([...images, url]);
      setIsAddingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleSetHero = (url: string) => {
    onHeroImageChange(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Gallery Images ({images.length}/{maxImages})
        </label>
        
        {images.length < maxImages && (
          <Dialog open={isAddingImage} onOpenChange={setIsAddingImage}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Gallery Image</DialogTitle>
              </DialogHeader>
              <ImageUploader
                label="Upload Image"
                onUploadComplete={handleAddImage}
                aspectRatio="16:9"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-border">
            <img
              src={url}
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant={heroImage === url ? "default" : "secondary"}
                onClick={() => handleSetHero(url)}
                title="Set as hero image"
              >
                <Star className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                variant="destructive"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {heroImage === url && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                Hero
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
