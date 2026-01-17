import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePaystackPayment } from "react-paystack";
import { usePaystackConfig } from "@/hooks/usePaystackConfig";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Package, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/paystack";

interface ProductCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    name: string;
    price: number;
    description?: string | null;
    image_url?: string | null;
  };
  businessId: string;
  businessName: string;
}

export function ProductCheckoutDialog({
  open,
  onOpenChange,
  product,
  businessId,
  businessName,
}: ProductCheckoutDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const totalPrice = product.price * quantity;

  const handlePaymentSuccess = async (reference: any) => {
    try {
      // Update order with payment reference
      if (orderId) {
        const { error } = await supabase
          .from("product_orders")
          .update({
            payment_reference: reference.reference,
            payment_status: "paid",
            status: "confirmed",
            paid_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        if (error) throw error;
      }

      toast.success("Payment successful! Your order has been confirmed.");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Payment received but order update failed. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const { config, isReady } = usePaystackConfig({
    amount: totalPrice,
    type: "advertisement", // Using this type for product orders
    entityId: orderId || undefined,
    metadata: {
      product_id: product.id,
      product_name: product.name,
      quantity,
      order_id: orderId,
      buyer_name: buyerName,
    },
    onSuccess: handlePaymentSuccess,
    onClose: () => {
      setIsProcessing(false);
    },
  });

  // Override email for non-authenticated users
  const paystackConfig = {
    ...config,
    email: buyerEmail || config.email,
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const resetForm = () => {
    setQuantity(1);
    setBuyerName("");
    setBuyerEmail("");
    setBuyerPhone("");
    setShippingAddress("");
    setNotes("");
    setOrderId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!buyerName || !buyerEmail) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsProcessing(true);

    try {
      // Create order first
      const { data: order, error } = await supabase
        .from("product_orders")
        .insert({
          product_id: product.id,
          business_id: businessId,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone || null,
          quantity,
          unit_price: product.price,
          total_price: totalPrice,
          shipping_address: shippingAddress || null,
          notes: notes || null,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      setOrderId(order.id);

      // Initialize Paystack payment
      initializePayment({
        onSuccess: handlePaymentSuccess,
        onClose: () => {
          setIsProcessing(false);
          toast.info("Payment cancelled");
        },
      });
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to create order");
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Buy Product
          </DialogTitle>
          <DialogDescription>
            Complete your purchase from {businessName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Summary */}
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h4 className="font-medium">{product.name}</h4>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
              <p className="text-lg font-bold text-primary mt-1">
                {formatCurrency(product.price)}
              </p>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          {/* Buyer Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="buyerName">Full Name *</Label>
              <Input
                id="buyerName"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyerEmail">Email *</Label>
              <Input
                id="buyerEmail"
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyerPhone">Phone Number</Label>
            <Input
              id="buyerPhone"
              type="tel"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="+233 XX XXX XXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Shipping Address</Label>
            <Textarea
              id="shippingAddress"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your delivery address"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Order Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              rows={2}
            />
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-4 border-t">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing || !buyerName || !buyerEmail}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay {formatCurrency(totalPrice)}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
