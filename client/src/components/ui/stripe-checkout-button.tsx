import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface StripeCheckoutButtonProps extends Omit<ButtonProps, "onClick"> {
  amount: number;
  description: string;
  onSuccess?: (paymentIntentId: string) => void;
  // Use a different name to avoid conflict with ButtonProps
  onPaymentError?: (error: Error) => void;
}

export function StripeCheckoutButton({
  amount,
  description,
  onSuccess,
  onPaymentError,
  children,
  ...props
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleClick = () => {
    setIsLoading(true);
    
    // Format for Stripe - amount should be in cents
    const amountInCents = Math.round(amount * 100);
    
    // Navigate to the checkout page with amount and description as URL parameters
    const params = new URLSearchParams({
      amount: amountInCents.toString(),
      description,
    });
    
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? "Processing..." : children || "Pay Now"}
    </Button>
  );
}