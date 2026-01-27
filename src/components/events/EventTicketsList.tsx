import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Search, Ticket, Users, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useEventTickets, useTicketMutations, EventTicket } from '@/hooks/useEventTickets';

interface EventTicketsListProps {
  eventId: string;
  eventTitle: string;
}

const EventTicketsList = ({ eventId, eventTitle }: EventTicketsListProps) => {
  const { data: tickets, isLoading } = useEventTickets(eventId);
  const { checkInTicket } = useTicketMutations();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = tickets?.filter(ticket =>
    ticket.attendee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.attendee_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const checkedInCount = tickets?.filter(t => t.checked_in).length || 0;
  const totalTickets = tickets?.length || 0;

  const handleCheckIn = (ticket: EventTicket) => {
    checkInTicket.mutate({
      ticketId: ticket.id,
      checkedIn: !ticket.checked_in,
    });
  };

  const exportToCSV = () => {
    if (!tickets?.length) return;

    const headers = ['Ticket Number', 'Name', 'Email', 'Type', 'Checked In', 'Check-in Time'];
    const rows = tickets.map(t => [
      t.ticket_number,
      t.attendee_name || '',
      t.attendee_email || '',
      t.ticket_type,
      t.checked_in ? 'Yes' : 'No',
      t.checked_in_at ? format(new Date(t.checked_in_at), 'yyyy-MM-dd HH:mm') : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle.replace(/\s+/g, '-')}-attendees.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading tickets...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Tickets for {eventTitle}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!tickets?.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{totalTickets}</p>
              <p className="text-xs text-muted-foreground">Total Tickets</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{checkedInCount}</p>
              <p className="text-xs text-muted-foreground">Checked In</p>
            </div>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or ticket number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {tickets?.length === 0 ? 'No tickets sold yet' : 'No tickets match your search'}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Check In</TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Checkbox
                        checked={ticket.checked_in}
                        onCheckedChange={() => handleCheckIn(ticket)}
                      />
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {ticket.ticket_number}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.attendee_name}</p>
                        <p className="text-sm text-muted-foreground">{ticket.attendee_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ticket.ticket_type}</Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.checked_in ? (
                        <Badge className="bg-primary/10 text-primary border-0">
                          Checked In
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Checked In</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventTicketsList;
