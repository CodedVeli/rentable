import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function PaymentSuccess() {
  const [paymentInfo, setPaymentInfo] = useState<{
    paymentIntentId?: string;
    amount?: number;
    description?: string;
  }>({});
  
  useEffect(() => {
    // Get payment details from URL params
    const url = new URL(window.location.href);
    const paymentIntentId = url.searchParams.get('payment_intent');
    
    if (paymentIntentId) {
      // In a real app, you would fetch the payment details from your backend
      // For demo purposes, we'll extract the info from localStorage if available
      const storedPaymentInfo = localStorage.getItem(`payment_${paymentIntentId}`);
      if (storedPaymentInfo) {
        setPaymentInfo(JSON.parse(storedPaymentInfo));
      } else {
        setPaymentInfo({ paymentIntentId });
      }
    }
  }, []);

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-2">
            {paymentInfo.amount && (
              <div className="flex justify-between">
                <span className="text-slate-600">Amount Paid:</span>
                <span className="font-semibold">${(paymentInfo.amount / 100).toFixed(2)}</span>
              </div>
            )}
            {paymentInfo.description && (
              <div className="flex justify-between">
                <span className="text-slate-600">Description:</span>
                <span className="font-semibold">{paymentInfo.description}</span>
              </div>
            )}
            {paymentInfo.paymentIntentId && (
              <div className="flex justify-between">
                <span className="text-slate-600">Payment ID:</span>
                <span className="font-mono text-xs">{paymentInfo.paymentIntentId}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-center text-slate-600">
            A receipt has been sent to your email address.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild>
            <Link to="/">
              Return to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/payments">
              View Payments
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}