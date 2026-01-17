import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, X, Star, ImagePlus } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

interface ProductImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

interface SortableImageProps {
  url: string;
  index: number;
  onRemove: () => void;
  onSetMain: () => void;
  isMain: boolean;
}

const SortableImage = ({ url, index, onRemove, onSetMain, isMain }: SortableImageProps) => {
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
      className="relative group rounded-lg overflow-hidden border-2 border-border bg-muted aspect-square"
    >
      <img src={url} alt={`Product image ${index + 1}`} className="w-full h-full object-cover" />
      
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1 bg-background/80 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Main Badge */}
      {isMain && (
        <Badge className="absolute top-2 right-2 bg-primary gap-1">
          <Star className="h-3 w-3" />
          Main
        </Badge>
      )}

      {/* Actions Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        {!isMain && (
          <Button size="sm" variant="secondary" onClick={onSetMain}>
            Set as Main
          </Button>
        )}
        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const ProductImageManager = ({ images, onChange, maxImages = 4 }: ProductImageManagerProps) => {
  const [showUploader, setShowUploader] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);
      onChange(arrayMove(images, oldIndex, newIndex));
    }
  };

  const handleRemove = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handleSetMain = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [moved] = newImages.splice(index, 1);
    newImages.unshift(moved);
    onChange(newImages);
  };

  const handleUploadComplete = (url: string) => {
    if (images.length < maxImages) {
      onChange([...images, url]);
    }
    setShowUploader(false);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Drag to reorder. First image is the main product image.
        </p>
        <span className="text-sm text-muted-foreground">
          {images.length}/{maxImages} images
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={images} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3">
            {images.map((url, index) => (
              <SortableImage
                key={url}
                url={url}
                index={index}
                isMain={index === 0}
                onRemove={() => handleRemove(index)}
                onSetMain={() => handleSetMain(index)}
              />
            ))}

            {/* Add Image Button */}
            {canAddMore && !showUploader && (
              <button
                type="button"
                onClick={() => setShowUploader(true)}
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Add Image</span>
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Uploader Modal */}
      {showUploader && (
        <div className="p-4 border rounded-lg bg-muted/30">
          <ImageUploader
            onUploadComplete={handleUploadComplete}
            label="Upload Product Image"
            aspectRatio="square"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowUploader(false)}
            className="mt-2"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;
