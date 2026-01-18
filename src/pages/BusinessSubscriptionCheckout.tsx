import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { PromoCodeInput } from "@/components/subscriptions/PromoCodeInput";
import { useAuth } from "@/contexts/AuthContext";
import { usePaystackPublicKey } from "@/hooks/usePaystackPublicKey";
import { PaystackButton } from "react-paystack";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CheckCircle } from "lucide-react";
import { generatePaymentReference, toPesewas, PAYSTACK_CURRENCY } from "@/lib/paystack";

export default function BusinessSubscriptionCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");
  const businessIdParam = searchParams.get("business");
  const { user } = useAuth();
  const { plans } = useSubscriptionPlans();
  const { publicKey, isLoading: isLoadingKey, isConfigured } = usePaystackPublicKey();
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(businessIdParam || "");
  const [isActivating, setIsActivating] = useState(false);
  const [companyDetails, setCompanyDetails] = useState({
    company_name: "",
    tax_id: "",
  });

  // Fetch user's businesses
  const { data: userBusinesses, isLoading: loadingBusinesses } = useQuery({
    queryKey: ['user-businesses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('business_owners')
        .select('business_id, businesses(id, name)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data?.map(bo => bo.businesses).filter(Boolean) || [];
    },
    enabled: !!user?.id,
  });

  const selectedPlan = plans?.find(p => p.id === planId);

  // Auto-select business if only one exists or if param provided
  useEffect(() => {
    if (businessIdParam) {
      setSelectedBusinessId(businessIdParam);
    } else if (userBusinesses?.length === 1 && !selectedBusinessId) {
      setSelectedBusinessId((userBusinesses[0] as any).id);
    }
  }, [userBusinesses, businessIdParam, selectedBusinessId]);

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
  const isFreePlan = total === 0;

  const paymentReference = generatePaymentReference("business_subscription", selectedBusinessId);

  // Handle free plan activation
  const handleFreeSubscription = async () => {
    if (!selectedBusinessId || !companyDetails.company_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsActivating(true);

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 100); // Effectively unlimited for free plan

      const { error } = await supabase
        .from('business_subscriptions')
        .insert({
          business_id: selectedBusinessId,
          plan_id: selectedPlan.id,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          auto_renew: false,
          payment_method: 'free',
          amount: 0,
        });

      if (error) throw error;

      toast.success("Free plan activated successfully!");
      navigate("/manage-subscription");
    } catch (error: any) {
      console.error("Free subscription error:", error);
      toast.error(error.message || "Failed to activate free plan. Please try again.");
    } finally {
      setIsActivating(false);
    }
  };

  const paystackConfig = {
    email: user?.email || "",
    amount: toPesewas(total),
    currency: PAYSTACK_CURRENCY,
    publicKey: publicKey,
    reference: paymentReference,
    text: "Complete Purchase",
    metadata: {
      payment_type: "business_subscription",
      business_id: selectedBusinessId,
      plan_id: selectedPlan.id,
      user_id: user?.id,
      promo_code: promoCode || null,
      custom_fields: [
        {
          display_name: "Business ID",
          variable_name: "business_id",
          value: selectedBusinessId,
        },
        {
          display_name: "Plan",
          variable_name: "plan_name",
          value: selectedPlan.name,
        },
      ],
    },
    onSuccess: async (reference: any) => {
      try {
        // Call edge function to verify and create subscription
        const { error } = await supabase.functions.invoke("verify-business-subscription-payment", {
          body: {
            reference: reference.reference,
            businessId: selectedBusinessId,
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

  if (loadingBusinesses) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!userBusinesses?.length) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <p>You need to register a business first.</p>
            <Button onClick={() => navigate("/register-business")} className="mt-4">
              Register Business
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isFormValid = agreed && companyDetails.company_name && selectedBusinessId;
  const isPaymentReady = isFormValid && isConfigured && !isLoadingKey;

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
                  <CardTitle>Business & Company Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userBusinesses.length > 1 && (
                    <div className="space-y-2">
                      <Label>Select Business *</Label>
                      <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a business" />
                        </SelectTrigger>
                        <SelectContent>
                          {userBusinesses.map((business: any) => (
                            <SelectItem key={business.id} value={business.id}>
                              {business.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

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

              {!isFreePlan && (
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
              )}

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
                      <span>{isFreePlan ? "Free" : `GH₵${subtotal}`}</span>
                    </div>

                    {discount > 0 && !isFreePlan && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discount}%)</span>
                        <span>-GH₵{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>{isFreePlan ? "Free" : `GH₵${total.toFixed(2)}`}</span>
                    </div>
                  </div>

                  {isFreePlan && (
                    <p className="text-sm text-green-600 text-center flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      No payment required
                    </p>
                  )}

                  {isFreePlan ? (
                    <Button
                      className="w-full"
                      onClick={handleFreeSubscription}
                      disabled={!isFormValid || isActivating}
                    >
                      {isActivating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Activating...
                        </>
                      ) : (
                        "Activate Free Plan"
                      )}
                    </Button>
                  ) : isLoadingKey ? (
                    <Button disabled className="w-full">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </Button>
                  ) : (
                    <PaystackButton
                      {...paystackConfig}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md disabled:opacity-50"
                      disabled={!isPaymentReady}
                    />
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    {isFreePlan ? "Start using your free plan immediately" : "Secure payment powered by Paystack"}
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
