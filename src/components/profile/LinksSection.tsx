import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, FileText, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface LinksSectionProps {
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  resumeUrl: string;
  userId: string;
  onLinkedinChange: (url: string) => void;
  onGithubChange: (url: string) => void;
  onPortfolioChange: (url: string) => void;
  onResumeUrlChange: (url: string) => void;
}

const LinksSection = ({
  linkedinUrl,
  githubUrl,
  portfolioUrl,
  resumeUrl,
  userId,
  onLinkedinChange,
  onGithubChange,
  onPortfolioChange,
  onResumeUrlChange,
}: LinksSectionProps) => {
  const [uploading, setUploading] = useState(false);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume file must be less than 5MB");
      return;
    }

    if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
      toast.error("Resume must be PDF, DOC, or DOCX");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/resume.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('job-applications')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = await supabase.storage
        .from('job-applications')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year
      
      if (urlData?.signedUrl) {
        onResumeUrlChange(urlData.signedUrl);
        toast.success("Resume uploaded successfully!");
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      toast.error("Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="linkedin">LinkedIn Profile</Label>
        <div className="flex gap-2">
          <Input
            id="linkedin"
            value={linkedinUrl}
            onChange={(e) => onLinkedinChange(e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
          />
          {linkedinUrl && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              asChild
            >
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="github">GitHub Profile</Label>
        <div className="flex gap-2">
          <Input
            id="github"
            value={githubUrl}
            onChange={(e) => onGithubChange(e.target.value)}
            placeholder="https://github.com/yourusername"
          />
          {githubUrl && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              asChild
            >
              <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio">Portfolio / Website</Label>
        <div className="flex gap-2">
          <Input
            id="portfolio"
            value={portfolioUrl}
            onChange={(e) => onPortfolioChange(e.target.value)}
            placeholder="https://yourportfolio.com"
          />
          {portfolioUrl && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              asChild
            >
              <a href={portfolioUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume">Resume / CV</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            className="hidden"
            disabled={uploading}
          />
          <label htmlFor="resume" className="cursor-pointer">
            {resumeUrl ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-green-600" />
                <span className="text-sm font-medium text-foreground">Resume uploaded</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  asChild
                  className="mt-2"
                >
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                </Button>
                <span className="text-xs text-muted-foreground">Click to replace</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? "Uploading..." : "Click to upload resume (PDF, DOC, DOCX - max 5MB)"}
                </span>
              </div>
            )}
          </label>
        </div>
      </div>
    </div>
  );
};

export default LinksSection;
