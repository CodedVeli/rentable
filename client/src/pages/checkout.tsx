import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount, description }: { amount: number, description: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setPaymentStatus('error');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast({
        title: "Payment Successful",
        description: "Thank you for your payment!",
      });
      setPaymentStatus('success');
    }

    setIsProcessing(false);
  }

  if (paymentStatus === 'success') {
    return (
      <div className="p-6 space-y-4 bg-green-50 rounded-lg border border-green-200">
        <h2 className="text-2xl font-bold text-green-700">Payment Successful!</h2>
        <p className="text-green-600">Thank you for your payment of ${(amount / 100).toFixed(2)}.</p>
        <p className="text-green-600">Your transaction has been completed successfully.</p>
        <Button className="mt-4" onClick={() => window.location.href = '/'}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
        <PaymentElement />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          <p>Amount: <span className="font-semibold">${(amount / 100).toFixed(2)}</span></p>
          <p className="text-xs mt-1 opacity-80">Secure payment powered by Stripe</p>
        </div>
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="min-w-[140px]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            "Pay Now"
          )}
        </Button>
      </div>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useAuth();
  
  // Get amount and description from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const amount = parseInt(searchParams.get('amount') || '0');
  const description = searchParams.get('description') || 'Payment';

  useEffect(() => {
    if (!amount) {
      setErrorMessage("Invalid payment amount");
      setIsLoading(false);
      return;
    }

    // Create PaymentIntent as soon as the page loads
    setIsLoading(true);
    apiRequest("POST", "/api/create-payment-intent", { amount, description })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create payment intent");
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch((error) => {
        setErrorMessage(error.message || "An error occurred while setting up the payment");
        setIsLoading(false);
      });
  }, [amount, description]);

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (errorMessage) {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Payment Error</CardTitle>
            <CardDescription>
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>
            {description} - ${(amount / 100).toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <CheckoutForm amount={amount} description={description} />
            </Elements>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          Your payment information is securely processed by Stripe.
        </CardFooter>
      </Card>
    </div>
  );
}