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
    <div className="space-y-4 sm:space-y-6">
      {/* Tertiary Education */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Tertiary Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="tertiary-institution" className="text-xs sm:text-sm">Institution Name</Label>
            <Input
              id="tertiary-institution"
              placeholder="e.g., University of Ghana"
              className="h-9 sm:h-10 text-sm"
              value={data.tertiary?.institution || ''}
              onChange={(e) => updateField('tertiary', 'institution', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="tertiary-qualification" className="text-xs sm:text-sm">Qualification</Label>
              <Input
                id="tertiary-qualification"
                placeholder="e.g., BSc Computer Science"
                className="h-9 sm:h-10 text-sm"
                value={data.tertiary?.qualification || ''}
                onChange={(e) => updateField('tertiary', 'qualification', e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="tertiary-year" className="text-xs sm:text-sm">Year Completed</Label>
              <Input
                id="tertiary-year"
                placeholder="e.g., 2020"
                className="h-9 sm:h-10 text-sm"
                value={data.tertiary?.yearCompleted || ''}
                onChange={(e) => updateField('tertiary', 'yearCompleted', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Education */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <School className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Secondary Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="secondary-institution" className="text-xs sm:text-sm">School Name</Label>
            <Input
              id="secondary-institution"
              placeholder="e.g., Achimota Senior High School"
              className="h-9 sm:h-10 text-sm"
              value={data.secondary?.institution || ''}
              onChange={(e) => updateField('secondary', 'institution', e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="secondary-year" className="text-xs sm:text-sm">Year Completed</Label>
            <Input
              id="secondary-year"
              placeholder="e.g., 2016"
              className="h-9 sm:h-10 text-sm"
              value={data.secondary?.yearCompleted || ''}
              onChange={(e) => updateField('secondary', 'yearCompleted', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Primary Education */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Primary Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="primary-institution" className="text-xs sm:text-sm">School Name</Label>
            <Input
              id="primary-institution"
              placeholder="e.g., Ridge Church School"
              className="h-9 sm:h-10 text-sm"
              value={data.primary?.institution || ''}
              onChange={(e) => updateField('primary', 'institution', e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="primary-year" className="text-xs sm:text-sm">Year Completed</Label>
            <Input
              id="primary-year"
              placeholder="e.g., 2013"
              className="h-9 sm:h-10 text-sm"
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
