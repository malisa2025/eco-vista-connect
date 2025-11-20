import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  duration?: number;
}

export const useCloudflareUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadToCloudflare = async (
    file: File,
    type: 'image' | 'video'
  ): Promise<UploadResult | null> => {
    setUploading(true);
    setProgress(0);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64File = await base64Promise;
      setProgress(30);

      // Call edge function
      const { data, error } = await supabase.functions.invoke('upload-to-cloudflare', {
        body: {
          file: base64File,
          type,
          fileName: file.name,
        },
      });

      setProgress(100);

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: 'Upload successful',
        description: `${type === 'video' ? 'Video' : 'Image'} uploaded successfully`,
      });

      return data;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadToCloudflare,
    uploading,
    progress,
  };
};
