import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
      {/* Mobile: Vertical stack, Desktop: Horizontal */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Avatar - centered on mobile */}
        <div className="flex justify-center sm:justify-start">
          <Avatar className="h-14 w-14 sm:h-10 sm:w-10">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 min-w-0 text-center sm:text-left">
          {/* Name and score row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
            <div>
              <h4 className="font-semibold text-base sm:text-sm truncate">
                {profile?.full_name || profile?.email}
              </h4>
              <p className="text-sm sm:text-xs text-muted-foreground">
                Applied {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}
              </p>
            </div>
            
            {/* Score badge */}
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 sm:mt-0">
              <Star className="h-4 w-4 sm:h-3 sm:w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-sm sm:text-xs font-medium">{application.quality_score || 0}</span>
            </div>
          </div>

          {/* Badges - centered on mobile */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-1 mt-3 sm:mt-2">
            {application.resume_url && (
              <Badge variant="secondary" className="text-sm sm:text-xs py-1 sm:py-0">
                <FileText className="h-4 w-4 sm:h-3 sm:w-3 mr-1" />
                Resume
              </Badge>
            )}
            {application.video_url && (
              <Badge variant="secondary" className="text-sm sm:text-xs py-1 sm:py-0">
                <Video className="h-4 w-4 sm:h-3 sm:w-3 mr-1" />
                Video
              </Badge>
            )}
            {hasInterview && (
              <Badge variant="secondary" className="text-sm sm:text-xs py-1 sm:py-0">
                <Calendar className="h-4 w-4 sm:h-3 sm:w-3 mr-1" />
                Interview
              </Badge>
            )}
            {hasNotes && (
              <Badge variant="secondary" className="text-sm sm:text-xs py-1 sm:py-0">
                <MessageSquare className="h-4 w-4 sm:h-3 sm:w-3 mr-1" />
                {application.applicant_notes.length}
              </Badge>
            )}
          </div>

          {/* Tags - centered on mobile */}
          {tags.length > 0 && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-1 mt-3 sm:mt-2">
              {tags.map((tag: any) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-sm sm:text-xs"
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
