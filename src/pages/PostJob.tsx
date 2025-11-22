import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessOwners } from "@/hooks/useBusinessClaims";
import { useJobMutations } from "@/hooks/useJobs";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrialBanner } from "@/components/subscriptions/TrialBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import AIGenerateButton from "@/components/jobs/AIGenerateButton";
import { ArrowLeft, ArrowRight, Briefcase, Check } from "lucide-react";
import { toast } from "sonner";
import { addDays } from "date-fns";

interface JobFormData {
  business_id: string;
  title: string;
  category: string;
  location: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  experience_level: 'entry' | 'mid' | 'senior' | 'executive';
  description: string;
  requirements: string;
  responsibilities: string;
  salary_range: string;
  require_video: boolean;
  video_prompt: string;
  expires_at: string;
}

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: ownerships } = useBusinessOwners(user?.id);
  const { createJob } = useJobMutations();

  const [currentStep, setCurrentStep] = useState(1);
  const [aiLoading, setAiLoading] = useState<{ [key: string]: boolean }>({});
  
  const [formData, setFormData] = useState<JobFormData>({
    business_id: '',
    title: '',
    category: '',
    location: '',
    job_type: 'full_time',
    experience_level: 'mid',
    description: '',
    requirements: '',
    responsibilities: '',
    salary_range: '',
    require_video: false,
    video_prompt: '',
    expires_at: addDays(new Date(), 30).toISOString().split('T')[0],
  });

  const businesses = ownerships?.map(o => o.businesses).filter(Boolean) || [];
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const categories = [
    "Technology", "Sales & Marketing", "Customer Service", "Finance & Accounting",
    "Healthcare", "Education", "Hospitality", "Manufacturing", "Construction",
    "Transport & Logistics", "Retail", "Other"
  ];

  const generateAIContent = async (type: 'description' | 'requirements' | 'responsibilities') => {
    if (!formData.title || !formData.category) {
      toast.error("Please enter job title and category first");
      return;
    }

    setAiLoading({ ...aiLoading, [type]: true });

    try {
      const { data, error } = await supabase.functions.invoke('generate-job-description', {
        body: {
          jobTitle: formData.title,
          industry: formData.category,
          experienceLevel: formData.experience_level,
          type: type,
        },
      });

      if (error) throw error;

      if (data && data.content) {
        setFormData({ ...formData, [type]: data.content });
        toast.success("Content generated successfully!");
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast.error(error.message || "Failed to generate content");
    } finally {
      setAiLoading({ ...aiLoading, [type]: false });
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.business_id || !formData.title || !formData.category || !formData.location) {
          toast.error("Please fill in all required fields");
          return false;
        }
        return true;
      case 2:
        if (!formData.description || formData.description.length < 100) {
          toast.error("Description must be at least 100 characters");
          return false;
        }
        return true;
      case 3:
        if (!formData.requirements || formData.requirements.length < 50) {
          toast.error("Requirements must be at least 50 characters");
          return false;
        }
        if (!formData.responsibilities || formData.responsibilities.length < 50) {
          toast.error("Responsibilities must be at least 50 characters");
          return false;
        }
        return true;
      case 4:
        if (formData.require_video && !formData.video_prompt) {
          toast.error("Please enter a video prompt question");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handlePublish = async (isDraft: boolean = false) => {
    const jobData = {
      ...formData,
      status: isDraft ? 'draft' : 'active',
      posted_at: isDraft ? null : new Date().toISOString(),
    };

    createJob.mutate(jobData, {
      onSuccess: () => {
        toast.success(isDraft ? "Job saved as draft!" : "Job posted successfully!");
        navigate('/my-businesses?tab=jobs');
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <TrialBanner 
        trialEndDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
        planName="Pro"
      />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold">Post a Job</h1>
                <p className="text-muted-foreground">Create a professional job listing with AI assistance</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Form Steps */}
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Basic Information"}
                {currentStep === 2 && "Job Description"}
                {currentStep === 3 && "Requirements & Responsibilities"}
                {currentStep === 4 && "Additional Details"}
                {currentStep === 5 && "Preview & Publish"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Start with the job basics"}
                {currentStep === 2 && "Describe the role with AI assistance"}
                {currentStep === 3 && "Define what you're looking for"}
                {currentStep === 4 && "Add final details"}
                {currentStep === 5 && "Review and publish your job listing"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="business">Business *</Label>
                    <Select value={formData.business_id} onValueChange={(value) => setFormData({ ...formData, business_id: value })}>
                      <SelectTrigger id="business">
                        <SelectValue placeholder="Select your business" />
                      </SelectTrigger>
                      <SelectContent>
                        {businesses.map((business: any) => (
                          <SelectItem key={business.id} value={business.id}>
                            {business.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Senior Software Engineer"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Accra, Ghana"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job_type">Job Type *</Label>
                      <Select value={formData.job_type} onValueChange={(value: any) => setFormData({ ...formData, job_type: value })}>
                        <SelectTrigger id="job_type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full-time</SelectItem>
                          <SelectItem value="part_time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience_level">Experience Level *</Label>
                      <Select value={formData.experience_level} onValueChange={(value: any) => setFormData({ ...formData, experience_level: value })}>
                        <SelectTrigger id="experience_level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Description */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Job Description *</Label>
                    <AIGenerateButton
                      onClick={() => generateAIContent('description')}
                      loading={aiLoading.description}
                      disabled={!formData.title || !formData.category}
                    />
                  </div>
                  <Textarea
                    id="description"
                    placeholder="Describe the role, responsibilities, and what makes it exciting..."
                    rows={12}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.description.length} / 2000 characters (minimum 100)
                  </p>
                </div>
              )}

              {/* Step 3: Requirements & Responsibilities */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requirements">Requirements *</Label>
                      <AIGenerateButton
                        onClick={() => generateAIContent('requirements')}
                        loading={aiLoading.requirements}
                        disabled={!formData.title || !formData.category}
                      />
                    </div>
                    <Textarea
                      id="requirements"
                      placeholder="List the qualifications, skills, and experience needed..."
                      rows={8}
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="responsibilities">Responsibilities *</Label>
                      <AIGenerateButton
                        onClick={() => generateAIContent('responsibilities')}
                        loading={aiLoading.responsibilities}
                        disabled={!formData.title || !formData.category}
                      />
                    </div>
                    <Textarea
                      id="responsibilities"
                      placeholder="Outline the day-to-day responsibilities..."
                      rows={8}
                      value={formData.responsibilities}
                      onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                      className="resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Additional Details */}
              {currentStep === 4 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="salary_range">Salary Range (Optional)</Label>
                    <Input
                      id="salary_range"
                      placeholder="e.g., GHS 3,000 - 5,000 per month"
                      value={formData.salary_range}
                      onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="require_video"
                        checked={formData.require_video}
                        onCheckedChange={(checked) => setFormData({ ...formData, require_video: checked as boolean })}
                      />
                      <Label htmlFor="require_video" className="cursor-pointer">
                        Require video application
                      </Label>
                    </div>

                    {formData.require_video && (
                      <div className="space-y-2 pl-6">
                        <Label htmlFor="video_prompt">Video Prompt Question *</Label>
                        <Textarea
                          id="video_prompt"
                          placeholder="e.g., Tell us about a challenging project you've worked on and how you solved it."
                          rows={3}
                          value={formData.video_prompt}
                          onChange={(e) => setFormData({ ...formData, video_prompt: e.target.value })}
                        />
                        <p className="text-sm text-muted-foreground">
                          This question will be shown to applicants when they record their video
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expires_at">Job Expiration Date</Label>
                    <Input
                      id="expires_at"
                      type="date"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-sm text-muted-foreground">
                      Job will automatically close after this date
                    </p>
                  </div>
                </>
              )}

              {/* Step 5: Preview */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="p-6 bg-muted rounded-lg space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{formData.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{formData.category}</Badge>
                        <Badge variant="outline">{formData.job_type.replace('_', '-')}</Badge>
                        <Badge variant="outline">{formData.experience_level}</Badge>
                        {formData.require_video && <Badge variant="outline">Video Required</Badge>}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Location</p>
                      <p>{formData.location}</p>
                    </div>

                    {formData.salary_range && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Salary Range</p>
                        <p className="font-semibold">{formData.salary_range}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Description</p>
                      <p className="whitespace-pre-wrap">{formData.description}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Requirements</p>
                      <p className="whitespace-pre-wrap">{formData.requirements}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Responsibilities</p>
                      <p className="whitespace-pre-wrap">{formData.responsibilities}</p>
                    </div>

                    {formData.require_video && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Video Prompt</p>
                        <p className="italic">{formData.video_prompt}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handlePublish(true)}
                      variant="outline"
                      disabled={createJob.isPending}
                      className="flex-1"
                    >
                      Save as Draft
                    </Button>
                    <Button
                      onClick={() => handlePublish(false)}
                      disabled={createJob.isPending}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Publish Job
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 5 && (
                <div className="flex justify-between pt-6 border-t">
                  {currentStep > 1 ? (
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {currentStep === 5 && (
                <Button variant="outline" onClick={handleBack} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Edit
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostJob;
