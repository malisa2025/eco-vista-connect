import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Video, Star, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ApplicantComparisonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applications: any[];
}

const ApplicantComparison = ({
  open,
  onOpenChange,
  applications,
}: ApplicantComparisonProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Compare Applicants</DialogTitle>
          <DialogDescription>Compare selected candidates side by side</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((application) => {
              const profile = application.profiles;
              return (
                <div key={application.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{profile?.full_name}</h4>
                      <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quality Score</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{application.quality_score || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="secondary" className="capitalize">
                        {application.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Applied</span>
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(application.applied_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold">Materials</h5>
                    <div className="flex flex-wrap gap-2">
                      {application.resume_url && (
                        <Badge variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Resume
                        </Badge>
                      )}
                      {application.video_url && (
                        <Badge variant="outline">
                          <Video className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      )}
                    </div>
                  </div>

                  {application.applicant_tags?.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold">Tags</h5>
                      <div className="flex flex-wrap gap-1">
                        {application.applicant_tags.map((tag: any) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: tag.color, color: tag.color }}
                          >
                            {tag.tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold">Cover Letter</h5>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {application.cover_letter}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicantComparison;
