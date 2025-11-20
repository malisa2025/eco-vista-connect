import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApplicationMutations } from "@/hooks/useJobApplications";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Upload, FileText } from "lucide-react";
import VideoRecorder from "./VideoRecorder";
import { supabase } from "@/integrations/supabase/client";

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
  requireVideo: boolean;
  videoPrompt?: string;
  onClose: () => void;
}

const ApplicationForm = ({ jobId, jobTitle, requireVideo, videoPrompt, onClose }: ApplicationFormProps) => {
  const { user } = useAuth();
  const { submitApplication } = useApplicationMutations();
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTab, setVideoTab] = useState<"record" | "upload">("record");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Resume file must be less than 5MB");
        return;
      }
      if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
        toast.error("Resume must be PDF, DOC, or DOCX");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video file must be less than 50MB");
        return;
      }
      if (!file.name.match(/\.(mp4|webm|mov)$/i)) {
        toast.error("Video must be MP4, WEBM, or MOV");
        return;
      }
      setVideoFile(file);
    }
  };

  const uploadFile = async (file: File, type: "resume" | "video") => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${jobId}/${type}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('job-applications')
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: urlData } = await supabase.storage
      .from('job-applications')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year
    
    return urlData?.signedUrl || null;
  };

  const handleSubmit = async () => {
    if (coverLetter.length < 100) {
      toast.error("Cover letter must be at least 100 characters");
      return;
    }

    if (requireVideo && !videoFile) {
      toast.error("Video submission is required for this position");
      return;
    }

    setIsSubmitting(true);

    try {
      let resumeUrl = null;
      if (resumeFile) {
        resumeUrl = await uploadFile(resumeFile, "resume");
      }

      let videoUrl = null;
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, "video");
      }

      await submitApplication.mutateAsync({
        job_id: jobId,
        user_id: user!.id,
        cover_letter: coverLetter,
        resume_url: resumeUrl,
        video_url: videoUrl,
      });

      toast.success("Application submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Application submission error:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cover Letter */}
          <div>
            <Label htmlFor="coverLetter">
              Cover Letter <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Tell the employer why you're a great fit (minimum 100 characters)
            </p>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="I am excited to apply for this position because..."
              rows={8}
              className="resize-none"
            />
            <div className="text-sm text-muted-foreground mt-1">
              {coverLetter.length} / 100 characters minimum
            </div>
          </div>

          {/* Resume Upload */}
          <div>
            <Label htmlFor="resume">Resume (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              PDF, DOC, or DOCX (max 5MB)
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="hidden"
              />
              <label htmlFor="resume" className="cursor-pointer">
                {resumeFile ? (
                  <div className="flex items-center justify-center gap-2 text-foreground">
                    <FileText className="w-5 h-5" />
                    <span>{resumeFile.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload resume
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Video Section */}
          {requireVideo && (
            <div>
              <Label>
                Video Submission {requireVideo && <span className="text-destructive">*</span>}
              </Label>
              {videoPrompt && (
                <p className="text-sm text-muted-foreground mb-2">
                  "{videoPrompt}"
                </p>
              )}
              
              <Tabs value={videoTab} onValueChange={(v) => setVideoTab(v as "record" | "upload")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="record">Record Video</TabsTrigger>
                  <TabsTrigger value="upload">Upload Video</TabsTrigger>
                </TabsList>
                
                <TabsContent value="record" className="mt-4">
                  <VideoRecorder
                    onVideoReady={(file) => setVideoFile(file)}
                    videoPrompt={videoPrompt}
                    maxDuration={180}
                  />
                </TabsContent>
                
                <TabsContent value="upload" className="mt-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      id="video"
                      type="file"
                      accept=".mp4,.webm,.mov"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <label htmlFor="video" className="cursor-pointer">
                      {videoFile ? (
                        <div className="flex items-center justify-center gap-2 text-foreground">
                          <FileText className="w-5 h-5" />
                          <span>{videoFile.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload video (MP4, WEBM, MOV - max 50MB)
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationForm;
