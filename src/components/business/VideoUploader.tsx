import { useState, useRef } from 'react';
import { X, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoRecorder from '@/components/jobs/VideoRecorder';
import { useCloudflareUpload } from '@/hooks/useCloudflareUpload';
import HLSVideoPlayer from '@/components/HLSVideoPlayer';

interface VideoUploaderProps {
  onUploadComplete: (url: string, thumbnailUrl?: string, duration?: number) => void;
  currentVideoUrl?: string;
  prompt?: string;
}

export const VideoUploader = ({
  onUploadComplete,
  currentVideoUrl,
  prompt = "Tell us about your business in 60 seconds",
}: VideoUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(currentVideoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadToCloudflare, uploading, progress } = useCloudflareUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Video size must be less than 50MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Cloudflare
    const result = await uploadToCloudflare(file, 'video');
    if (result) {
      // Use previewUrl for display if available (Cloudflare watch URL works immediately)
      if (result.previewUrl) {
        setPreview(result.previewUrl);
      }
      onUploadComplete(result.url, result.thumbnailUrl, result.duration);
    }
  };

  const handleRecordingComplete = async (file: File) => {
    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Cloudflare
    const result = await uploadToCloudflare(file, 'video');
    if (result) {
      // Use previewUrl for display if available
      if (result.previewUrl) {
        setPreview(result.previewUrl);
      }
      onUploadComplete(result.url, result.thumbnailUrl, result.duration);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Business Intro Video</label>
      
      {preview ? (
        <div className="relative">
          {/* Use native video for local previews (data URLs), HLS for remote URLs */}
          {preview.startsWith('data:') ? (
            <video
              src={preview}
              className="w-full rounded-lg"
              controls
            />
          ) : (
            <HLSVideoPlayer
              src={preview}
              className="w-full rounded-lg"
              controls
            />
          )}
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
          
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <Progress value={progress} className="w-2/3" />
              <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
            <TabsTrigger value="record">Record Video</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div
              className="relative w-full aspect-video border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/10 cursor-pointer hover:bg-muted/20 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <Video className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload video</p>
                <p className="text-xs text-muted-foreground mt-1">Max 50MB, 2-3 minutes recommended</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </TabsContent>
          
          <TabsContent value="record">
            <VideoRecorder
              onVideoReady={handleRecordingComplete}
              videoPrompt={prompt}
              maxDuration={180}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
