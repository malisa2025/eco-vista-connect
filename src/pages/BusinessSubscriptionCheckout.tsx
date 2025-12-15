import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { PromoCodeInput } from "@/components/subscriptions/PromoCodeInput";
import { useAuth } from "@/contexts/AuthContext";
import { PaystackButton } from "react-paystack";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function BusinessSubscriptionCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");
  const { user } = useAuth();
  const { plans } = useSubscriptionPlans();
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [companyDetails, setCompanyDetails] = useState({
    company_name: "",
    tax_id: "",
  });

  const selectedPlan = plans?.find(p => p.id === planId);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!selectedPlan) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <p>Plan not found. Please select a plan.</p>
            <Button onClick={() => navigate("/subscription-plans")} className="mt-4">
              View Plans
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const subtotal = selectedPlan.price;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const paystackConfig = {
    email: user?.email || "",
    amount: total * 100, // Convert to pesewas
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
    text: "Complete Purchase",
    onSuccess: async (reference: any) => {
      try {
        // Call edge function to verify and create subscription
        const { error } = await supabase.functions.invoke("verify-business-subscription-payment", {
          body: {
            reference: reference.reference,
            planId: selectedPlan.id,
            userId: user?.id,
            promoCode: promoCode || null,
            companyDetails,
          },
        });

        if (error) throw error;

        toast.success("Subscription activated successfully!");
        navigate("/manage-subscription");
      } catch (error) {
        console.error("Payment verification error:", error);
        toast.error("Failed to activate subscription. Please contact support.");
      }
    },
    onClose: () => {
      toast.info("Payment cancelled");
    },
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Complete Your Subscription</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Billing Details */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      required
                      value={companyDetails.company_name}
                      onChange={(e) => setCompanyDetails({ ...companyDetails, company_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_id">Tax ID / Registration Number</Label>
                    <Input
                      id="tax_id"
                      value={companyDetails.tax_id}
                      onChange={(e) => setCompanyDetails({ ...companyDetails, tax_id: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Promo Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <PromoCodeInput
                    onApply={(code, discountPercent) => {
                      setPromoCode(code);
                      setDiscount(discountPercent);
                    }}
                  />
                </CardContent>
              </Card>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to the Terms & Conditions and Privacy Policy
                </Label>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-lg">{selectedPlan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPlan.billing_period} billing
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>GH₵{subtotal}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discount}%)</span>
                        <span>-GH₵{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>GH₵{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <PaystackButton
                    {...paystackConfig}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md disabled:opacity-50"
                    disabled={!agreed || !companyDetails.company_name}
                  />

                  <p className="text-xs text-muted-foreground text-center">
                    Secure payment powered by Paystack
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
