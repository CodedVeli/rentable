import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Payment, InsertPayment, Lease, insertPaymentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addMonths } from "date-fns";
import { Loader2, CalendarClock, Check, X, PlusCircle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";

// Extend the insert schema for form validation
const paymentFormSchema = insertPaymentSchema.extend({
  // Add any additional validation if needed
  amount: z.coerce.number().min(1, { message: "Amount must be greater than 0" }),
  leaseId: z.coerce.number().min(1, { message: "Please select a lease" }),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function LandlordPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      description: "",
      status: "pending",
      leaseId: 0,
      landlordId: user?.id,
      tenantId: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    },
  });

  const { data: payments, isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    onError: (error: Error) => {
      toast({
        title: "Failed to load payments",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: leases, isLoading: isLoadingLeases } = useQuery<Lease[]>({
    queryKey: ["/api/leases"],
    onError: (error: Error) => {
      toast({
        title: "Failed to load leases",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      const response = await apiRequest("POST", "/api/payments", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Request Created",
        description: "Payment request has been sent to the tenant.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create payment request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectLease = (leaseId: string) => {
    const selectedLease = leases?.find(lease => lease.id === parseInt(leaseId));
    if (selectedLease) {
      form.setValue("tenantId", selectedLease.tenantId);
      form.setValue("landlordId", selectedLease.landlordId);
      
      // Suggest a rent payment description
      const propertyName = selectedLease.propertyAddress || `Lease #${selectedLease.id}`;
      const nextMonth = addMonths(new Date(), 1);
      const monthYear = format(nextMonth, "MMMM yyyy");
      
      form.setValue("description", `Rent for ${propertyName} - ${monthYear}`);
      
      // Set amount to monthly rent if available
      if (selectedLease.monthlyRent) {
        form.setValue("amount", selectedLease.monthlyRent);
      }
    }
  };

  const onSubmit = (data: PaymentFormValues) => {
    createPaymentMutation.mutate(data);
  };

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

  if (isLoadingPayments || isLoadingLeases) {
    return (
      <AppLayout>
        <div className="flex h-full w-full items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const pendingPayments = payments?.filter(p => p.status === "pending" || p.status === "overdue") || [];
  const paidPayments = payments?.filter(p => p.status === "paid") || [];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Payments Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                Request Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Request Payment</DialogTitle>
                <DialogDescription>
                  Create a new payment request to send to your tenant.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="leaseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lease</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleSelectLease(value);
                          }}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a lease" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {leases?.map((lease) => (
                              <SelectItem key={lease.id} value={lease.id.toString()}>
                                {lease.propertyAddress || `Lease #${lease.id}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the lease for this payment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (CAD)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0.00"
                            type="number"
                            step="0.01"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Rent for May 2023"
                            className="resize-none"
                            value={field.value as string}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value as string}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createPaymentMutation.isPending}>
                      {createPaymentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Request Payment"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {pendingPayments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>
                Payments that haven't been completed yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.tenantId ? `Tenant #${payment.tenantId}` : 'N/A'}
                      </TableCell>
                      <TableCell>{payment.description}</TableCell>
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
                Completed payments from your tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Paid Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Transaction ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.tenantId ? `Tenant #${payment.tenantId}` : 'N/A'}
                      </TableCell>
                      <TableCell>{payment.description}</TableCell>
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

        {!pendingPayments.length && !paidPayments.length && (
          <Card className="p-10">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-medium">No Payments Yet</h3>
              <p className="text-muted-foreground">
                You haven't created any payment requests yet. Click "Request Payment" to get started.
              </p>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}