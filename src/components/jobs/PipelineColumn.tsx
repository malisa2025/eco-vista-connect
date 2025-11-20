import { Badge } from '@/components/ui/badge';
import ApplicantCard from './ApplicantCard';

interface PipelineColumnProps {
  status: string;
  title: string;
  applications: any[];
  onViewDetails: (application: any) => void;
  onDrop: (applicationId: string, newStatus: string) => void;
}

const PipelineColumn = ({
  status,
  title,
  applications,
  onViewDetails,
  onDrop,
}: PipelineColumnProps) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const applicationId = e.dataTransfer.getData('applicationId');
    if (applicationId) {
      onDrop(applicationId, status);
    }
  };

  const handleDragStart = (e: React.DragEvent, applicationId: string) => {
    e.dataTransfer.setData('applicationId', applicationId);
  };

  return (
    <div
      className="flex-1 min-w-[280px] bg-muted/30 rounded-lg p-4"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Badge variant="secondary">{applications.length}</Badge>
      </div>

      <div className="space-y-3">
        {applications.map((application) => (
          <div
            key={application.id}
            draggable
            onDragStart={(e) => handleDragStart(e, application.id)}
          >
            <ApplicantCard
              application={application}
              onViewDetails={() => onViewDetails(application)}
            />
          </div>
        ))}
      </div>

      {applications.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-8">
          No applicants in this stage
        </div>
      )}
    </div>
  );
};

export default PipelineColumn;
