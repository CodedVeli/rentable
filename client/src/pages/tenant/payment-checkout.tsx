import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  paymentId: number;
  amount: number;
  description: string;
}

const CheckoutForm = ({ paymentId, amount, description }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/tenant/payments',
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your payment!",
      });
      setLocation('/tenant/payments');
    }
    
    setIsProcessing(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Processing...
          </>
        ) : (
          `Pay ${new Intl.NumberFormat('en-CA', { 
            style: 'currency', 
            currency: 'CAD' 
          }).format(amount)}`
        )}
      </Button>
    </form>
  );
};

export default function PaymentCheckout() {
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const paymentId = parseInt(searchParams.get('id') || '0');
  const amount = parseFloat(searchParams.get('amount') || '0');
  const description = searchParams.get('description') || '';

  const { isLoading: isPaymentLoading } = useQuery({
    queryKey: ['/api/payments', paymentId],
    enabled: paymentId > 0,
  });

  useEffect(() => {
    if (paymentId <= 0 || amount <= 0) {
      toast({
        title: "Invalid Payment",
        description: "Missing or invalid payment information",
        variant: "destructive",
      });
      setLocation('/tenant/payments');
      return;
    }

    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", { 
          amount: amount * 100, // Convert to cents for Stripe
          paymentId 
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
        setLocation('/tenant/payments');
      }
    };

    createPaymentIntent();
  }, [paymentId, amount, toast, setLocation]);

  if (isPaymentLoading || !clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Preparing your payment...</p>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span>Amount:</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('en-CA', { 
                  style: 'currency', 
                  currency: 'CAD' 
                }).format(amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment ID:</span>
              <span className="font-mono">{paymentId}</span>
            </div>
          </div>
          
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm paymentId={paymentId} amount={amount} description={description} />
          </Elements>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/tenant/payments">
            <Button variant="outline">Cancel</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}