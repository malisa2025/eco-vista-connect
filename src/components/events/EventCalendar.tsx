import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { useEventsByMonth } from '@/hooks/useEventTickets';
import CalendarDayModal from './CalendarDayModal';

interface EventCalendarProps {
  onEventClick?: (eventId: string) => void;
}

const EventCalendar = ({ onEventClick }: EventCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const { data: events, isLoading } = useEventsByMonth(year, month);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events?.filter(event => 
      isSameDay(new Date(event.start_date), date)
    ) || [];
  };

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              Loading calendar...
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Week day headers */}
              {weekDays.map(day => (
                <div
                  key={day}
                  className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="h-24" />
              ))}

              {/* Calendar days */}
              {daysInMonth.map(day => {
                const dayEvents = getEventsForDay(day);
                const hasEvents = dayEvents.length > 0;
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => hasEvents && setSelectedDate(day)}
                    className={`
                      h-24 p-1 border rounded-lg transition-colors text-left
                      ${isCurrentDay ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}
                      ${hasEvents ? 'cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    <div className={`
                      text-sm font-medium mb-1
                      ${isCurrentDay ? 'text-primary' : 'text-foreground'}
                    `}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* Event indicators */}
                    <div className="space-y-0.5 overflow-hidden">
                      {dayEvents.slice(0, 2).map((event, idx) => (
                        <div
                          key={event.id}
                          className="text-xs truncate px-1 py-0.5 rounded bg-primary/10 text-primary"
                        >
                          {format(new Date(event.start_date), 'HH:mm')} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day Modal */}
      {selectedDate && (
        <CalendarDayModal
          date={selectedDate}
          events={getEventsForDay(selectedDate)}
          open={!!selectedDate}
          onOpenChange={(open) => !open && setSelectedDate(null)}
          onEventClick={onEventClick}
        />
      )}
    </>
  );
};

export default EventCalendar;
