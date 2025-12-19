import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, School, BookOpen } from 'lucide-react';

interface EducationData {
  tertiary?: {
    institution: string;
    qualification: string;
    yearCompleted: string;
  };
  secondary?: {
    institution: string;
    yearCompleted: string;
  };
  primary?: {
    institution: string;
    yearCompleted: string;
  };
}

interface EducationSectionProps {
  education: string;
  onChange: (education: string) => void;
}

const parseEducation = (education: string): EducationData => {
  try {
    const parsed = JSON.parse(education);
    return parsed;
  } catch {
    // If it's not JSON, return empty structure
    return {
      tertiary: { institution: '', qualification: '', yearCompleted: '' },
      secondary: { institution: '', yearCompleted: '' },
      primary: { institution: '', yearCompleted: '' },
    };
  }
};

const EducationSection = ({ education, onChange }: EducationSectionProps) => {
  const data = parseEducation(education);

  const updateField = (
    level: 'tertiary' | 'secondary' | 'primary',
    field: string,
    value: string
  ) => {
    const newData = {
      ...data,
      [level]: {
        ...data[level],
        [field]: value,
      },
    };
    onChange(JSON.stringify(newData));
  };

  return (
    <div className="space-y-6">
      {/* Tertiary Education */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Tertiary Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tertiary-institution">Institution Name</Label>
            <Input
              id="tertiary-institution"
              placeholder="e.g., University of Ghana"
              value={data.tertiary?.institution || ''}
              onChange={(e) => updateField('tertiary', 'institution', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tertiary-qualification">Qualification</Label>
              <Input
                id="tertiary-qualification"
                placeholder="e.g., BSc Computer Science"
                value={data.tertiary?.qualification || ''}
                onChange={(e) => updateField('tertiary', 'qualification', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tertiary-year">Year Completed</Label>
              <Input
                id="tertiary-year"
                placeholder="e.g., 2020"
                value={data.tertiary?.yearCompleted || ''}
                onChange={(e) => updateField('tertiary', 'yearCompleted', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Education */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            Secondary Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secondary-institution">School Name</Label>
            <Input
              id="secondary-institution"
              placeholder="e.g., Achimota Senior High School"
              value={data.secondary?.institution || ''}
              onChange={(e) => updateField('secondary', 'institution', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary-year">Year Completed</Label>
            <Input
              id="secondary-year"
              placeholder="e.g., 2016"
              value={data.secondary?.yearCompleted || ''}
              onChange={(e) => updateField('secondary', 'yearCompleted', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Primary Education */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Primary Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary-institution">School Name</Label>
            <Input
              id="primary-institution"
              placeholder="e.g., Ridge Church School"
              value={data.primary?.institution || ''}
              onChange={(e) => updateField('primary', 'institution', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primary-year">Year Completed</Label>
            <Input
              id="primary-year"
              placeholder="e.g., 2013"
              value={data.primary?.yearCompleted || ''}
              onChange={(e) => updateField('primary', 'yearCompleted', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationSection;
