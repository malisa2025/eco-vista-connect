import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePaystackPublicKey } from "@/hooks/usePaystackPublicKey";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Shield, CreditCard, Loader2 } from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PAYSTACK_CURRENCY } from "@/lib/paystack";

const SubscribeJobSeeker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { publicKey, isLoading: isLoadingKey, isConfigured } = usePaystackPublicKey();
  const [isProcessing, setIsProcessing] = useState(false);

  const config = {
    reference: `sub_${user?.id}_${Date.now()}`,
    email: user?.email || "",
    amount: 10 * 100, // 10 GHS in pesewas
    currency: PAYSTACK_CURRENCY,
    publicKey: publicKey,
  };

  const onSuccess = async (reference: any) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-subscription-payment', {
        body: { reference: reference.reference },
      });

      if (error) throw error;

      toast.success('Subscription activated successfully!');
      navigate('/my-applications');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Payment verification failed. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onClose = () => {
    toast.info('Payment cancelled');
  };

  const initializePayment = usePaystackPayment(config);

  const handleSubscribe = () => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      navigate('/auth');
      return;
    }
    if (!isConfigured) {
      toast.error('Payment system is not available. Please try again later.');
      return;
    }
    initializePayment({ onSuccess, onClose });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-16">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Subscribe to Apply for Jobs
            </h1>
            <p className="text-xl text-muted-foreground">
              Access unlimited job opportunities across Ghana
            </p>
          </div>

          {/* Pricing Card */}
          <div className="max-w-2xl mx-auto mb-16">
            <Card className="p-8 border-primary/20">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Job Seeker Subscription
                </h2>
                <div className="flex items-baseline justify-center gap-2 mb-6">
                  <span className="text-5xl font-bold text-primary">10 GHS</span>
                  <span className="text-muted-foreground">/ month</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Apply to unlimited job listings</p>
                    <p className="text-sm text-muted-foreground">No restrictions on applications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Your profile visible to employers</p>
                    <p className="text-sm text-muted-foreground">Get discovered by top companies</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Track all your applications</p>
                    <p className="text-sm text-muted-foreground">Monitor application status in real-time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Get email notifications</p>
                    <p className="text-sm text-muted-foreground">Stay updated on status changes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Access to video application features</p>
                    <p className="text-sm text-muted-foreground">Stand out with video introductions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Cancel anytime</p>
                    <p className="text-sm text-muted-foreground">No long-term commitment required</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSubscribe} 
                size="lg" 
                className="w-full mb-4"
                disabled={isProcessing || isLoadingKey || !isConfigured}
              >
                {isProcessing ? "Processing..." : isLoadingKey ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : "Subscribe Now"}
              </Button>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>Money-back guarantee</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  <span>Secure via Paystack</span>
                </div>
              </div>
            </Card>
          </div>

          {/* How It Works */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Subscribe</h3>
                <p className="text-muted-foreground">
                  Pay 10 GHS securely via Paystack
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Apply</h3>
                <p className="text-muted-foreground">
                  Submit applications with your profile
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Get Hired</h3>
                <p className="text-muted-foreground">
                  Track status and respond to employers
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time from your profile. Your subscription will remain active until the end of your current billing period.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Is this a recurring payment?</h3>
                <p className="text-muted-foreground">
                  Yes, it renews monthly automatically. You'll be notified 3 days before each renewal.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-2">What happens if I don't renew?</h3>
                <p className="text-muted-foreground">
                  You won't be able to submit new applications, but your existing applications will remain active and visible to employers.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Is my payment secure?</h3>
                <p className="text-muted-foreground">
                  Yes, we use Paystack's secure payment infrastructure. Your payment information is never stored on our servers.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SubscribeJobSeeker;
