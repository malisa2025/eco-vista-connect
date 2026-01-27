import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Ticket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentButton } from '@/components/payments/PaymentButton';
import { formatCurrency } from '@/lib/paystack';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TicketPurchaseFormProps {
  event: {
    id: string;
    title: string;
    price: number | null;
    capacity: number | null;
    attendees_count: number | null;
    business_id: string;
  };
  onSuccess: (tickets: any[]) => void;
  onCancel: () => void;
}

interface AttendeeInfo {
  name: string;
  email: string;
}

const TicketPurchaseForm = ({ event, onSuccess, onCancel }: TicketPurchaseFormProps) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([
    { name: '', email: user?.email || '' },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const ticketPrice = event.price || 0;
  const totalPrice = ticketPrice * quantity;
  const isFree = ticketPrice === 0;
  const remainingCapacity = event.capacity 
    ? event.capacity - (event.attendees_count || 0)
    : Infinity;
  const maxTickets = Math.min(5, remainingCapacity);

  const updateQuantity = (newQty: number) => {
    const qty = Math.max(1, Math.min(newQty, maxTickets));
    setQuantity(qty);
    
    // Adjust attendees array
    if (qty > attendees.length) {
      const newAttendees = [...attendees];
      for (let i = attendees.length; i < qty; i++) {
        newAttendees.push({ name: '', email: '' });
      }
      setAttendees(newAttendees);
    } else if (qty < attendees.length) {
      setAttendees(attendees.slice(0, qty));
    }
  };

  const updateAttendee = (index: number, field: keyof AttendeeInfo, value: string) => {
    const updated = [...attendees];
    updated[index][field] = value;
    setAttendees(updated);
  };

  const isFormValid = attendees.every(a => a.name.trim() && a.email.trim());

  const handleFreeRegistration = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to register for this event.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Call edge function to create free tickets
      const { data, error } = await supabase.functions.invoke('verify-event-ticket-payment', {
        body: {
          event_id: event.id,
          user_id: user.id,
          attendees,
          is_free: true,
        },
      });

      if (error) throw error;
      onSuccess(data.tickets);
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to register for event.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (reference: any) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-event-ticket-payment', {
        body: {
          event_id: event.id,
          user_id: user?.id,
          attendees,
          payment_reference: reference.reference,
          amount: totalPrice,
        },
      });

      if (error) throw error;
      onSuccess(data.tickets);
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify payment.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quantity Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Select Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">General Admission</p>
              <p className="text-sm text-muted-foreground">
                {isFree ? 'Free' : formatCurrency(ticketPrice)} per ticket
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(quantity + 1)}
                disabled={quantity >= maxTickets}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {event.capacity && (
            <p className="text-xs text-muted-foreground mt-2">
              {remainingCapacity} spots remaining
            </p>
          )}
        </CardContent>
      </Card>

      {/* Attendee Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Attendee Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {attendees.map((attendee, index) => (
            <div key={index} className="space-y-3 pb-4 border-b last:border-b-0 last:pb-0">
              {quantity > 1 && (
                <p className="text-sm font-medium text-muted-foreground">
                  Ticket {index + 1}
                </p>
              )}
              <div className="grid gap-3">
                <div>
                  <Label htmlFor={`name-${index}`}>Full Name</Label>
                  <Input
                    id={`name-${index}`}
                    value={attendee.name}
                    onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                    placeholder="Enter attendee name"
                  />
                </div>
                <div>
                  <Label htmlFor={`email-${index}`}>Email</Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={attendee.email}
                    onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{quantity}x General Admission</span>
              <span>{isFree ? 'Free' : formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Total</span>
              <span>{isFree ? 'Free' : formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        {isFree ? (
          <Button 
            onClick={handleFreeRegistration} 
            disabled={!isFormValid || isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'Registering...' : 'Register Now'}
          </Button>
        ) : (
          <PaymentButton
            amount={totalPrice}
            email={attendees[0]?.email || user?.email || ''}
            type="event_ticket"
            entityId={event.id}
            metadata={{
              payment_type: 'event_ticket',
              event_id: event.id,
              quantity,
              attendees,
            }}
            onSuccess={handlePaymentSuccess}
            onClose={() => {}}
            disabled={!isFormValid || isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'Processing...' : `Pay ${formatCurrency(totalPrice)}`}
          </PaymentButton>
        )}
      </div>
    </div>
  );
};

export default TicketPurchaseForm;
