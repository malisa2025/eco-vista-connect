import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Video, Star, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ApplicantCardProps {
  application: any;
  onViewDetails: () => void;
  draggable?: boolean;
}

const ApplicantCard = ({ application, onViewDetails, draggable = true }: ApplicantCardProps) => {
  const profile = application.profiles;
  const tags = application.applicant_tags || [];
  const hasInterview = application.interview_schedule?.length > 0;
  const hasNotes = application.applicant_notes?.length > 0;

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      draggable={draggable}
      onClick={onViewDetails}
    >
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback>
            {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm truncate">
                {profile?.full_name || profile?.email}
              </h4>
              <p className="text-xs text-muted-foreground">
                Applied {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-medium">{application.quality_score || 0}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {application.resume_url && (
              <Badge variant="secondary" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Resume
              </Badge>
            )}
            {application.video_url && (
              <Badge variant="secondary" className="text-xs">
                <Video className="h-3 w-3 mr-1" />
                Video
              </Badge>
            )}
            {hasInterview && (
              <Badge variant="secondary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Interview
              </Badge>
            )}
            {hasNotes && (
              <Badge variant="secondary" className="text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                {application.applicant_notes.length}
              </Badge>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag: any) => (
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
          )}
        </div>
      </div>
    </Card>
  );
};

export default ApplicantCard;
