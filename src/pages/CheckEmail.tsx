import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from 'sonner';
import logoImage from '@/assets/logo-ghkonect.jpg';

const CheckEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  
  const email = location.state?.email || '';

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('No email address found. Please try signing up again.');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verification email resent! Please check your inbox.');
      }
    } catch (err) {
      toast.error('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-subtle">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <img 
              src={logoImage} 
              alt="GHKonect Logo" 
              className="w-12 h-12 rounded-xl object-cover"
            />
            <span className="text-2xl font-display font-bold">GHKonect</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription className="text-base">
              We've sent a verification link to
            </CardDescription>
            {email && (
              <p className="font-medium text-foreground mt-2">{email}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
              <p>📧 Check your inbox (and spam folder)</p>
              <p>🔗 Click the verification link in the email</p>
              <p>✅ You'll be signed in automatically</p>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResendEmail}
                disabled={isResending || !email}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Resending...' : 'Resend Verification Email'}
              </Button>
              
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/auth')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Wrong email?{' '}
              <button
                onClick={() => navigate('/auth')}
                className="text-primary hover:underline font-medium"
              >
                Try again with a different email
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckEmail;
