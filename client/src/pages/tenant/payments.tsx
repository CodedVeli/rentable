import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Payment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Loader2, CalendarClock, ArrowRight, CreditCard, Check, X } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/layout/app-layout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TenantPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    onError: (error: Error) => {
      toast({
        title: "Failed to load payments",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500"><CalendarClock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-500"><X className="h-3 w-3 mr-1" /> Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handlePayNow = (payment: Payment) => {
    setLocation(`/tenant/payment-checkout?id=${payment.id}&amount=${payment.amount}&description=${encodeURIComponent(payment.description)}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const duePayments = payments?.filter(p => p.status === "pending" || p.status === "overdue") || [];
  const paidPayments = payments?.filter(p => p.status === "paid") || [];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Your Payments</h1>
        </div>

      {duePayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payments Due</CardTitle>
            <CardDescription>
              These payments require your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {duePayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.description}</TableCell>
                    <TableCell>
                      {payment.dueDate 
                        ? format(new Date(payment.dueDate), "MMM d, yyyy") 
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-CA", {
                        style: "currency",
                        currency: "CAD",
                      }).format(payment.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <Button 
                        onClick={() => handlePayNow(payment)}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <CreditCard className="h-4 w-4" />
                        Pay Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {paidPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              Your completed payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.description}</TableCell>
                    <TableCell>
                      {payment.paidDate 
                        ? format(new Date(payment.paidDate), "MMM d, yyyy") 
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-CA", {
                        style: "currency",
                        currency: "CAD",
                      }).format(payment.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.transactionId ? payment.transactionId.substring(0, 16) + "..." : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!duePayments.length && !paidPayments.length && (
        <Card className="p-10">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-medium">No Payments Found</h3>
            <p className="text-muted-foreground">
              You don't have any payments due or completed yet.
            </p>
          </div>
        </Card>
      )}
      </div>
    </AppLayout>
  );
}