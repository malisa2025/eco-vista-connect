import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock, Copy } from 'lucide-react';

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

interface BusinessHours {
  [key: string]: DayHours;
}

interface BusinessHoursEditorProps {
  value: BusinessHours | null;
  onChange: (hours: BusinessHours) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_HOURS: DayHours = {
  open: '09:00',
  close: '17:00',
  closed: false,
};

export const BusinessHoursEditor = ({ value, onChange }: BusinessHoursEditorProps) => {
  const [hours, setHours] = useState<BusinessHours>(() => {
    if (value && Object.keys(value).length > 0) {
      return value;
    }
    // Initialize with default hours for all days
    return DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = { ...DEFAULT_HOURS };
      return acc;
    }, {} as BusinessHours);
  });

  const updateDay = (day: string, updates: Partial<DayHours>) => {
    const newHours = {
      ...hours,
      [day]: {
        ...hours[day],
        ...updates,
      },
    };
    setHours(newHours);
    onChange(newHours);
  };

  const copyToAllWeekdays = (sourceDay: string) => {
    const sourceHours = hours[sourceDay];
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const newHours = { ...hours };
    weekdays.forEach(day => {
      newHours[day] = { ...sourceHours };
    });
    setHours(newHours);
    onChange(newHours);
  };

  const copyToWeekend = (sourceDay: string) => {
    const sourceHours = hours[sourceDay];
    const weekend = ['Saturday', 'Sunday'];
    const newHours = { ...hours };
    weekend.forEach(day => {
      newHours[day] = { ...sourceHours };
    });
    setHours(newHours);
    onChange(newHours);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Business Hours</h3>
      </div>

      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center justify-between sm:w-32">
              <Label className="font-medium">{day}</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={!hours[day]?.closed}
                onCheckedChange={(checked) => updateDay(day, { closed: !checked })}
              />
              <span className="text-sm text-muted-foreground">
                {hours[day]?.closed ? 'Closed' : 'Open'}
              </span>
            </div>

            {!hours[day]?.closed && (
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground whitespace-nowrap">From</Label>
                  <Input
                    type="time"
                    value={hours[day]?.open || '09:00'}
                    onChange={(e) => updateDay(day, { open: e.target.value })}
                    className="w-28"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground whitespace-nowrap">To</Label>
                  <Input
                    type="time"
                    value={hours[day]?.close || '17:00'}
                    onChange={(e) => updateDay(day, { close: e.target.value })}
                    className="w-28"
                  />
                </div>
              </div>
            )}

            {day === 'Monday' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyToAllWeekdays(day)}
                className="ml-auto"
              >
                <Copy className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Copy to weekdays</span>
              </Button>
            )}

            {day === 'Saturday' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyToWeekend(day)}
                className="ml-auto"
              >
                <Copy className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Copy to Sunday</span>
              </Button>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Set your opening and closing times for each day. Toggle the switch to mark a day as closed.
      </p>
    </div>
  );
};

export default BusinessHoursEditor;
