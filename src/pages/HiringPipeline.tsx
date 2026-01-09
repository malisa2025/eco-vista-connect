import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PipelineColumn from '@/components/jobs/PipelineColumn';
import ApplicantCard from '@/components/jobs/ApplicantCard';
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
  const [mobileSelectedStatus, setMobileSelectedStatus] = useState<string>('pending');

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

  const getMobileStatusApplications = () => {
    return applications?.filter((app) => app.status === mobileSelectedStatus) || [];
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

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link to="/my-businesses">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold">{job?.title}</h1>
              <p className="text-sm text-muted-foreground">
                {applications?.length || 0} total applications
              </p>
            </div>
          </div>

          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedForCompare([]);
            }}
            className="self-end sm:self-auto"
          >
            <GitCompare className="h-4 w-4 mr-2" />
            Compare ({selectedForCompare.length}/3)
          </Button>
        </div>

        {/* Empty State */}
        {applications?.length === 0 && (
          <Card className="p-8 sm:p-12">
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

        {/* Pipeline */}
        {applications && applications.length > 0 && (
          <>
            {/* Mobile View - Dropdown + Vertical List */}
            <div className="sm:hidden space-y-4">
              <Select value={mobileSelectedStatus} onValueChange={setMobileSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => {
                    const count = applications?.filter((app) => app.status === status.key).length || 0;
                    return (
                      <SelectItem key={status.key} value={status.key}>
                        {status.label} ({count})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <div className="space-y-3">
                {getMobileStatusApplications().map((application) => (
                  <ApplicantCard
                    key={application.id}
                    application={application}
                    onViewDetails={() => {
                      if (compareMode) {
                        toggleCompareSelection(application);
                      } else {
                        setSelectedApplication(application);
                      }
                    }}
                    draggable={false}
                  />
                ))}
                {getMobileStatusApplications().length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-12 bg-muted/30 rounded-lg">
                    No applicants in this stage
                  </div>
                )}
              </div>
            </div>

            {/* Desktop View - Horizontal Kanban */}
            <div className="hidden sm:block">
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
            </div>
          </>
        )}

        {/* Application Detail Modal */}
        <Dialog
          open={!!selectedApplication && !compareMode}
          onOpenChange={(open) => !open && setSelectedApplication(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Applicant Details</DialogTitle>
              <DialogDescription>Review applicant information, notes, and schedule interviews</DialogDescription>
            </DialogHeader>

            {selectedApplication && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs sm:text-sm">Notes</TabsTrigger>
                  <TabsTrigger value="interview" className="text-xs sm:text-sm">Interview</TabsTrigger>
                  <TabsTrigger value="tags" className="text-xs sm:text-sm">Tags</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <ScrollArea className="h-[60vh]">
                    <div className="space-y-4 pr-4">
                      {/* Profile */}
                      <Card className="p-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                          <Avatar className="h-20 w-20 sm:h-16 sm:w-16">
                            <AvatarImage src={selectedApplication.profiles?.avatar_url} />
                            <AvatarFallback>
                              {selectedApplication.profiles?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-center sm:text-left">
                            <h3 className="font-semibold text-lg">
                              {selectedApplication.profiles?.full_name}
                            </h3>
                            <p className="text-muted-foreground">
                              {selectedApplication.profiles?.email}
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mt-2">
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
                        <div className="flex flex-col sm:flex-row gap-2">
                          {selectedApplication.resume_url && (
                            <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
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
                            <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
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
                      className="w-full sm:w-auto"
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
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <p className="font-medium">
                                  {new Date(interview.scheduled_at).toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {interview.location || 'No location specified'}
                                </p>
                              </div>
                              <Badge className="capitalize self-start sm:self-center">{interview.status}</Badge>
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
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="e.g., Strong candidate, Culture fit..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleAddTag} disabled={!newTag.trim() || addTag.isPending} className="w-full sm:w-auto">
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
                            className="cursor-pointer py-1 px-3"
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
