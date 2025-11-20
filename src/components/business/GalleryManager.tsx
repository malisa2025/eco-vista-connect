import { useState } from 'react';
import { Plus, X, Star, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageUploader } from './ImageUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GalleryManagerProps {
  images: string[];
  heroImage?: string;
  onImagesChange: (images: string[]) => void;
  onHeroImageChange: (url: string) => void;
  maxImages?: number;
}

interface SortableImageItemProps {
  url: string;
  index: number;
  heroImage?: string;
  onSetHero: (url: string) => void;
  onRemove: () => void;
}

const SortableImageItem = ({ url, index, heroImage, onSetHero, onRemove }: SortableImageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group aspect-video rounded-lg overflow-hidden border border-border"
    >
      <img
        src={url}
        alt={`Gallery ${index + 1}`}
        className="w-full h-full object-cover"
      />
      
      {/* Drag handle - top-left corner */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="bg-black/60 p-1.5 rounded backdrop-blur-sm">
          <GripVertical className="h-4 w-4 text-white" />
        </div>
      </div>
      
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          size="icon"
          variant={heroImage === url ? "default" : "secondary"}
          onClick={() => onSetHero(url)}
          title="Set as hero image"
        >
          <Star className="h-4 w-4" />
        </Button>
        
        <Button
          size="icon"
          variant="destructive"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {heroImage === url && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
          Hero
        </div>
      )}
    </div>
  );
};

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(img => img === active.id);
      const newIndex = images.findIndex(img => img === over.id);
      
      const reorderedImages = arrayMove(images, oldIndex, newIndex);
      onImagesChange(reorderedImages);
    }
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

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((url, index) => (
              <SortableImageItem
                key={url}
                url={url}
                index={index}
                heroImage={heroImage}
                onSetHero={handleSetHero}
                onRemove={() => handleRemoveImage(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
