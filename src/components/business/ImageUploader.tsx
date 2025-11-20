import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCloudflareUpload } from '@/hooks/useCloudflareUpload';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  label: string;
  aspectRatio?: 'square' | '16:9';
  maxSizeMB?: number;
}

export const ImageUploader = ({
  onUploadComplete,
  currentImageUrl,
  label,
  aspectRatio = '16:9',
  maxSizeMB = 5,
}: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadToCloudflare, uploading, progress } = useCloudflareUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Cloudflare
    const result = await uploadToCloudflare(file, 'image');
    if (result) {
      onUploadComplete(result.url);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      <div className={`relative w-full ${aspectClass} border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/10`}>
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!uploading && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-muted/20 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">Max {maxSizeMB}MB</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <Progress value={progress} className="w-2/3" />
            <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />
    </div>
  );
};
