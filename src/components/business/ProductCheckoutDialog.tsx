import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePaystackPayment } from "react-paystack";
import { usePaystackConfig } from "@/hooks/usePaystackConfig";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Package, CreditCard, AlertCircle } from "lucide-react";
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
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const totalPrice = product.price * quantity;

  const handlePaymentSuccess = async (reference: any) => {
    try {
      // Verify payment with edge function
      const { data, error } = await supabase.functions.invoke("verify-product-order-payment", {
        body: { reference: reference.reference },
      });

      if (error) {
        console.error("Payment verification error:", error);
        toast.error("Payment verification failed. Please contact support.");
        return;
      }

      if (!data?.success) {
        toast.error("Payment verification failed. Please contact support.");
        return;
      }

      toast.success("Payment successful! Your order has been confirmed.");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Payment verification failed. Please contact support.");
    } finally {
      setIsProcessing(false);
      setPendingOrderId(null);
    }
  };

  const { config, isReady, isLoadingKey } = usePaystackConfig({
    amount: totalPrice,
    type: "product_order",
    email: buyerEmail, // Pass email for guest checkout
    entityId: pendingOrderId || undefined,
    metadata: {
      product_id: product.id,
      product_name: product.name,
      quantity,
      order_id: pendingOrderId,
      buyer_name: buyerName,
    },
    onSuccess: handlePaymentSuccess,
    onClose: () => {
      setIsProcessing(false);
      toast.info("Payment cancelled");
    },
  });

  const initializePayment = usePaystackPayment(config);

  // Trigger payment when order is created and config is ready
  useEffect(() => {
    if (pendingOrderId && isReady && isProcessing) {
      initializePayment({
        onSuccess: handlePaymentSuccess,
        onClose: () => {
          setIsProcessing(false);
          setPendingOrderId(null);
          toast.info("Payment cancelled");
        },
      });
    }
  }, [pendingOrderId, isReady, isProcessing]);

  const resetForm = () => {
    setQuantity(1);
    setBuyerName("");
    setBuyerEmail("");
    setBuyerPhone("");
    setShippingAddress("");
    setNotes("");
    setPendingOrderId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!buyerName || !buyerEmail) {
      toast.error("Please fill in required fields");
      return;
    }

    if (!isReady && !isLoadingKey) {
      toast.error("Payment system is not available. Please try again later.");
      return;
    }

    setIsProcessing(true);

    try {
      // Generate order ID client-side to avoid RLS SELECT issues
      const orderId = crypto.randomUUID();
      
      // Create order with pre-generated ID
      const { error } = await supabase
        .from("product_orders")
        .insert({
          id: orderId,
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
        });

      if (error) throw error;

      // Set pending order ID - this will trigger the useEffect to initialize payment
      setPendingOrderId(orderId);
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to create order. Please try again.");
      setIsProcessing(false);
    }
  };

  const isFormValid = buyerName.trim() && buyerEmail.trim();
  const canPay = isFormValid && isReady && !isLoadingKey;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Buy Product
          </DialogTitle>
          <DialogDescription>
            Complete your purchase from {businessName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <form onSubmit={handleSubmit} className="space-y-4 pb-6">
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

            {/* Payment not ready warning */}
            {!isReady && !isLoadingKey && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>Payment system is not available. Please try again later.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isProcessing || !canPay}
              >
                {isProcessing || isLoadingKey ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLoadingKey ? "Loading..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay {formatCurrency(totalPrice)}
                  </>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
