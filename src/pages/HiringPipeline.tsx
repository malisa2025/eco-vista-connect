import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PipelineColumn from '@/components/jobs/PipelineColumn';
import ApplicantComparison from '@/components/jobs/ApplicantComparison';
import ApplicantNotes from '@/components/jobs/ApplicantNotes';
import { usePipeline, useUpdateApplicationStatus } from '@/hooks/usePipelineManagement';
import { useAddTag, useRemoveTag, useScheduleInterview } from '@/hooks/useApplicantNotes';
import { ArrowLeft, UserCheck, FileText, Video, Calendar, Tag, GitCompare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const HiringPipeline = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { data: applications, isLoading } = usePipeline(jobId!);
  
  // Fetch the specific job
  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
  
  const updateStatus = useUpdateApplicationStatus();
  const addTag = useAddTag();
  const removeTag = useRemoveTag();
  const scheduleInterview = useScheduleInterview();

  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<any[]>([]);
  const [newTag, setNewTag] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  const statuses: Array<{
    key: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
    label: string;
  }> = [
    { key: 'pending', label: 'New Applications' },
    { key: 'reviewed', label: 'Reviewed' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'accepted', label: 'Accepted' },
  ];

  const handleDrop = (
    applicationId: string,
    newStatus: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted'
  ) => {
    updateStatus.mutate({ applicationId, status: newStatus, jobId });
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !selectedApplication) return;

    await addTag.mutateAsync({
      applicationId: selectedApplication.id,
      tag: newTag,
    });

    setNewTag('');
  };

  const handleScheduleInterview = async () => {
    if (!interviewDate || !selectedApplication) return;

    await scheduleInterview.mutateAsync({
      applicationId: selectedApplication.id,
      scheduledAt: new Date(interviewDate).toISOString(),
      location: interviewLocation,
      meetingLink,
    });

    setInterviewDate('');
    setInterviewLocation('');
    setMeetingLink('');
  };

  const toggleCompareSelection = (application: any) => {
    setSelectedForCompare((prev) => {
      const isSelected = prev.some((a) => a.id === application.id);
      if (isSelected) {
        return prev.filter((a) => a.id !== application.id);
      } else if (prev.length < 3) {
        return [...prev, application];
      }
      return prev;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">Loading pipeline...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-businesses">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{job?.title}</h1>
              <p className="text-muted-foreground">
                {applications?.length || 0} total applications
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={compareMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCompareMode(!compareMode);
                setSelectedForCompare([]);
              }}
            >
              <GitCompare className="h-4 w-4 mr-2" />
              Compare ({selectedForCompare.length}/3)
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {applications?.length === 0 && (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Share your job posting to start receiving applications. Once candidates apply, 
                  you can manage them through this pipeline.
                </p>
              </div>
              <Button asChild>
                <Link to={`/jobs/${jobId}`}>View Job Posting</Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Pipeline Columns */}
        {applications && applications.length > 0 && (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {statuses.map((status) => {
                const statusApplications = applications?.filter(
                  (app) => app.status === status.key
                ) || [];

                return (
                  <PipelineColumn
                    key={status.key}
                    status={status.key}
                    title={status.label}
                    applications={statusApplications}
                    onViewDetails={(app) => {
                      if (compareMode) {
                        toggleCompareSelection(app);
                      } else {
                        setSelectedApplication(app);
                      }
                    }}
                    onDrop={handleDrop}
                  />
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Application Detail Modal */}
        <Dialog
          open={!!selectedApplication && !compareMode}
          onOpenChange={(open) => !open && setSelectedApplication(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Applicant Details</DialogTitle>
            </DialogHeader>

            {selectedApplication && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="interview">Interview</TabsTrigger>
                  <TabsTrigger value="tags">Tags</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <ScrollArea className="h-[60vh]">
                    <div className="space-y-4 pr-4">
                      {/* Profile */}
                      <Card className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={selectedApplication.profiles?.avatar_url} />
                            <AvatarFallback>
                              {selectedApplication.profiles?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {selectedApplication.profiles?.full_name}
                            </h3>
                            <p className="text-muted-foreground">
                              {selectedApplication.profiles?.email}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="secondary" className="capitalize">
                                {selectedApplication.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Applied{' '}
                                {formatDistanceToNow(new Date(selectedApplication.applied_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Cover Letter */}
                      <Card className="p-4">
                        <h4 className="font-semibold mb-2">Cover Letter</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedApplication.cover_letter}
                        </p>
                      </Card>

                      {/* Attachments */}
                      <Card className="p-4">
                        <h4 className="font-semibold mb-2">Attachments</h4>
                        <div className="flex gap-2">
                          {selectedApplication.resume_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={selectedApplication.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View Resume
                              </a>
                            </Button>
                          )}
                          {selectedApplication.video_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={selectedApplication.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Watch Video
                              </a>
                            </Button>
                          )}
                        </div>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="notes">
                  <ApplicantNotes
                    applicationId={selectedApplication.id}
                    notes={selectedApplication.applicant_notes || []}
                  />
                </TabsContent>

                <TabsContent value="interview" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Interview Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        placeholder="Office, Phone, etc."
                        value={interviewLocation}
                        onChange={(e) => setInterviewLocation(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Meeting Link (Optional)</Label>
                      <Input
                        placeholder="Zoom, Meet, etc."
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleScheduleInterview}
                      disabled={!interviewDate || scheduleInterview.isPending}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Interview
                    </Button>
                  </div>

                  {selectedApplication.interview_schedule?.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Scheduled Interviews</h4>
                      <div className="space-y-2">
                        {selectedApplication.interview_schedule.map((interview: any) => (
                          <Card key={interview.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  {new Date(interview.scheduled_at).toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {interview.location || 'No location specified'}
                                </p>
                              </div>
                              <Badge className="capitalize">{interview.status}</Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tags" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Add Tag</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Strong candidate, Culture fit..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                      />
                      <Button onClick={handleAddTag} disabled={!newTag.trim() || addTag.isPending}>
                        <Tag className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {selectedApplication.applicant_tags?.length > 0 && (
                    <div className="space-y-2">
                      <Label>Current Tags</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.applicant_tags.map((tag: any) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="cursor-pointer"
                            style={{ borderColor: tag.color, color: tag.color }}
                            onClick={() => removeTag.mutate(tag.id)}
                          >
                            {tag.tag} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Comparison Modal */}
        <ApplicantComparison
          open={compareMode && selectedForCompare.length > 0}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedForCompare([]);
            }
          }}
          applications={selectedForCompare}
        />
      </main>

      <Footer />
    </div>
  );
};

export default HiringPipeline;
