import { CheckCircle2, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import type { Tables } from '@/integrations/supabase/types';

interface ProfileCompletenessProps {
  business: Tables<'businesses'>;
}

export const ProfileCompleteness = ({ business }: ProfileCompletenessProps) => {
  const checks = [
    { label: 'Logo uploaded', completed: !!business.logo_url },
    { label: 'Hero image uploaded', completed: !!business.image_url },
    { label: 'Gallery images (3+)', completed: (business.gallery_images?.length || 0) >= 3 },
    { label: 'Intro video recorded', completed: !!business.video_url },
    { label: 'Business hours set', completed: !!business.business_hours },
    { label: 'Contact info complete', completed: !!business.phone && !!business.email },
  ];

  const completedCount = checks.filter(c => c.completed).length;
  const percentage = Math.round((completedCount / checks.length) * 100);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Profile Completeness</h3>
            <span className="text-sm font-medium text-primary">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="space-y-2">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center gap-2">
              {check.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className={`text-sm ${check.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                {check.label}
              </span>
            </div>
          ))}
        </div>

        {percentage < 100 && (
          <p className="text-sm text-muted-foreground pt-2 border-t">
            Complete your profile to improve visibility and attract more customers!
          </p>
        )}
      </div>
    </Card>
  );
};
