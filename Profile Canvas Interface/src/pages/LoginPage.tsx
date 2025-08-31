import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, LogIn } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  
  const { sendOTP, verifyOTP, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await sendOTP(email);
      setStep('otp');
      toast({
        title: "Verification code sent",
        description: `Check your email at ${email} for the verification code.`,
      });
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) return;

    try {
      await verifyOTP(email, otpCode);
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtpCode('');
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 'email' ? 'Welcome back' : 'Enter verification code'}
          </CardTitle>
          <CardDescription>
            {step === 'email' 
              ? 'Enter your email to receive a verification code'
              : `We sent a 6-digit code to ${email}`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'email' ? (
            <div key="email">
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!email || isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send verification code'}
                </Button>
              </form>
            </div>
          ) : (
            <div key="otp">
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otpCode}
                      onChange={setOtpCode}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={otpCode.length !== 6 || isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Sign in'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToEmail}
                    className="w-full"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to email
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;