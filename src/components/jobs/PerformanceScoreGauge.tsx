import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PerformanceScoreGaugeProps {
  score: number;
  title?: string;
  subtitle?: string;
}

export const PerformanceScoreGauge = ({
  score,
  title = 'Overall Performance',
  subtitle,
}: PerformanceScoreGaugeProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    if (score >= 40) return 'bg-orange-600';
    return 'bg-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
            {score}
            <span className="text-2xl">/100</span>
          </div>
          <div className="text-lg font-medium">{getScoreLabel(score)}</div>
          <div className="w-full">
            <Progress value={score} className="h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ScoreBreakdownProps {
  visibility: number;
  engagement: number;
  conversion: number;
  quality: number;
}

export const ScoreBreakdown = ({
  visibility,
  engagement,
  conversion,
  quality,
}: ScoreBreakdownProps) => {
  const ScoreBar = ({ label, value }: { label: string; value: number }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}/100</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScoreBar label="Visibility" value={visibility} />
        <ScoreBar label="Engagement" value={engagement} />
        <ScoreBar label="Conversion" value={conversion} />
        <ScoreBar label="Applicant Quality" value={quality} />
      </CardContent>
    </Card>
  );
};
