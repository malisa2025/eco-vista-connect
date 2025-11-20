import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Video, Square, RotateCcw, Check, Camera } from "lucide-react";
import { toast } from "sonner";

interface VideoRecorderProps {
  onVideoReady: (file: File) => void;
  videoPrompt?: string;
  maxDuration?: number;
}

const VideoRecorder = ({ onVideoReady, videoPrompt, maxDuration = 180 }: VideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: true,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Could not access camera. Please allow camera permissions.');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], 'application-video.webm', {
          type: 'video/webm',
        });
        setRecordedVideo(file);
        
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        
        stopStream();
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const reRecord = () => {
    setRecordedVideo(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setRecordingTime(0);
    startCamera();
  };

  const useVideo = () => {
    if (recordedVideo) {
      onVideoReady(recordedVideo);
      toast.success('Video ready for submission');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!hasPermission && !recordedVideo) {
    return (
      <div className="border border-border rounded-lg p-8 text-center">
        <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">Camera Access Required</h3>
        <p className="text-sm text-muted-foreground mb-4">
          We need access to your camera to record your video application
        </p>
        <Button onClick={startCamera}>
          <Video className="w-4 h-4 mr-2" />
          Enable Camera
        </Button>
      </div>
    );
  }

  if (recordedVideo && previewUrl) {
    return (
      <div className="space-y-4">
        <video
          src={previewUrl}
          controls
          className="w-full rounded-lg border border-border"
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={reRecord} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Re-record
          </Button>
          <Button onClick={useVideo} className="flex-1">
            <Check className="w-4 h-4 mr-2" />
            Use This Video
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videoPrompt && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm font-medium text-foreground">"{videoPrompt}"</p>
        </div>
      )}
      
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full aspect-video object-cover"
        />
        
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full">
            <div className="w-3 h-3 bg-destructive-foreground rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              {formatTime(recordingTime)} / {formatTime(maxDuration)}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex justify-center">
        {!isRecording ? (
          <Button onClick={startRecording} size="lg">
            <Video className="w-5 h-5 mr-2" />
            Start Recording
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="destructive" size="lg">
            <Square className="w-5 h-5 mr-2" />
            Stop Recording
          </Button>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;
