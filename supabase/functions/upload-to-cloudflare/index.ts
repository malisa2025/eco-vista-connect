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
      
      if (!response.ok) {
        console.error('Cloudflare Stream error:', result);
        throw new Error(result.errors?.[0]?.message || 'Failed to upload video');
      }

      const videoData = result[resultKey];
      
      return new Response(JSON.stringify({
        success: true,
        url: `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoData.uid}/manifest/video.m3u8`,
        thumbnailUrl: videoData.thumbnail,
        duration: videoData.duration,
        uid: videoData.uid,
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
