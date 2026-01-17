import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLOUDFLARE_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file, type, fileName } = await req.json();

    if (!file) {
      throw new Error('No file provided');
    }

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      throw new Error('Cloudflare credentials not configured');
    }

    // Convert base64 to blob
    const base64Data = file.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const blob = new Blob([binaryData]);

    const formData = new FormData();
    formData.append('file', blob, fileName || 'upload');

    let uploadUrl: string;
    let resultKey: string;

    if (type === 'video') {
      // Upload to Cloudflare Stream
      uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;
      resultKey = 'result';
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log('Cloudflare Stream response:', JSON.stringify(result, null, 2));
      
      if (!response.ok) {
        console.error('Cloudflare Stream error:', result);
        throw new Error(result.errors?.[0]?.message || 'Failed to upload video');
      }

      const videoData = result[resultKey];
      
      // Cloudflare Stream provides playback URLs in the response
      // playback.hls is the HLS URL, playback.dash is the DASH URL
      // If playback is not immediately available, construct from preview URL
      let hlsUrl = videoData.playback?.hls;
      let dashUrl = videoData.playback?.dash;
      
      // If playback URLs not yet available (video still processing), use preview/watch URL
      if (!hlsUrl && videoData.preview) {
        // Preview URL format: https://watch.cloudflarestream.com/{uid}
        // HLS URL format: https://customer-{subdomain}.cloudflarestream.com/{uid}/manifest/video.m3u8
        // We need to use the iframe embed or wait for processing
        hlsUrl = videoData.preview; // Use preview URL as fallback
      }
      
      // Thumbnail URL
      const thumbnailUrl = videoData.thumbnail || `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoData.uid}/thumbnails/thumbnail.jpg`;
      
      return new Response(JSON.stringify({
        success: true,
        url: hlsUrl || videoData.preview,
        dashUrl: dashUrl,
        previewUrl: videoData.preview,
        thumbnailUrl: thumbnailUrl,
        duration: videoData.duration,
        uid: videoData.uid,
        status: videoData.status?.state || 'processing',
        readyToStream: videoData.readyToStream || false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Upload to Cloudflare Images
      uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Cloudflare Images error:', result);
        throw new Error(result.errors?.[0]?.message || 'Failed to upload image');
      }

      return new Response(JSON.stringify({
        success: true,
        url: result.result.variants[0],
        id: result.result.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in upload-to-cloudflare:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Upload failed',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
