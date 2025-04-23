import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, Clock, FileText, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Credit Check Page for Tenants
export default function CreditCheckPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [consentProvided, setConsentProvided] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Define types for better TypeScript support
  interface CreditCheckAvailability {
    available: boolean;
  }
  
  interface CreditReport {
    scoreFactors: string[];
    summary?: {
      totalAccounts: number;
      openAccounts: number;
      totalBalance: number;
      utilization: number;
    };
  }
  
  interface CreditCheck {
    id: number;
    userId: number;
    status: "pending" | "completed" | "failed" | "cancelled";
    requestDate: string;
    completedDate?: string;
    score?: number;
    report?: CreditReport;
  }

  // Check if a recent credit check is available
  const { data: checkAvailability, isLoading: isLoadingAvailability } = useQuery<CreditCheckAvailability>({
    queryKey: ["/api/credit-checks/available"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  // Get all credit checks for the user
  const { data: creditChecks, isLoading: isLoadingChecks } = useQuery<CreditCheck[]>({
    queryKey: ["/api/credit-checks"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  // Get most recent credit check
  const { data: recentCheck, isLoading: isLoadingRecentCheck } = useQuery<CreditCheck>({
    queryKey: ["/api/credit-checks/recent/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user && !!checkAvailability?.available,
  });

  // Mutation to request a credit check
  const requestCreditCheckMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/credit-check", {
        consentProvided,
        checkRecent: true, // Check if there's a recent credit check first
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-checks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-checks/recent/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-checks/available"] });
      
      if (data.isRecent) {
        toast({
          title: "Recent credit check found",
          description: "We found a recent credit check for you. No need to request a new one.",
          variant: "default",
        });
      } else {
        toast({
          title: "Credit check requested",
          description: "Your credit check has been requested. Check back soon for results.",
          variant: "default",
        });
      }
      
      setShowForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error requesting credit check",
        description: error.message || "There was an error requesting your credit check.",
        variant: "destructive",
      });
    },
  });

  // Mutation to cancel a credit check
  const cancelCreditCheckMutation = useMutation({
    mutationFn: async (creditCheckId: number) => {
      const res = await apiRequest("POST", `/api/credit-checks/${creditCheckId}/cancel`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-checks"] });
      toast({
        title: "Credit check cancelled",
        description: "Your credit check request has been cancelled.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error cancelling credit check",
        description: error.message || "There was an error cancelling your credit check.",
        variant: "destructive",
      });
    },
  });

  // Handle request credit check button click
  const handleRequestCreditCheck = () => {
    if (!consentProvided) {
      toast({
        title: "Consent required",
        description: "You must provide consent to request a credit check.",
        variant: "destructive",
      });
      return;
    }

    requestCreditCheckMutation.mutate();
  };

  // Handle cancel credit check button click
  const handleCancelCreditCheck = (creditCheckId: number) => {
    cancelCreditCheckMutation.mutate(creditCheckId);
  };

  // Get pending credit checks
  const pendingChecks = creditChecks?.filter((check) => check.status === "pending") || [];

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoadingAvailability || isLoadingChecks) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-6">Credit Check</h1>
      
      {/* Credit Score Display if available */}
      {recentCheck && recentCheck.status === "completed" && (
        <Card className="mb-8">
          <CardHeader className="bg-muted/50">
            <CardTitle>Your Credit Score</CardTitle>
            <CardDescription>
              Last updated: {formatDate(recentCheck.completedDate || recentCheck.requestDate)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-6 mb-4">
                    <span className="text-4xl font-bold text-primary">
                      {recentCheck.score || "N/A"}
                    </span>
                  </div>
                  <div>
                    {recentCheck.score && (
                      <p className="text-sm text-muted-foreground">
                        {recentCheck.score < 600
                          ? "Poor"
                          : recentCheck.score < 660
                          ? "Fair"
                          : recentCheck.score < 725
                          ? "Good"
                          : recentCheck.score < 760
                          ? "Very Good"
                          : "Excellent"}
                      </p>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold mb-2">Key Factors</h3>
                {recentCheck.report?.scoreFactors ? (
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {recentCheck.report.scoreFactors.map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No score factors available
                  </p>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold mb-2">Account Summary</h3>
                {recentCheck.report?.summary ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Accounts:</span>
                      <span>{recentCheck.report.summary.totalAccounts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Open Accounts:</span>
                      <span>{recentCheck.report.summary.openAccounts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Balance:</span>
                      <span>${recentCheck.report.summary.totalBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Credit Utilization:</span>
                      <span>{recentCheck.report.summary.utilization}%</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No account summary available
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end bg-muted/30">
            <Button variant="outline" onClick={() => window.print()}>
              <FileText className="mr-2 h-4 w-4" />
              Print Report
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Recent Credit Check Status */}
      {pendingChecks.length > 0 && (
        <Alert className="mb-8">
          <Clock className="h-4 w-4" />
          <AlertTitle>Credit check in progress</AlertTitle>
          <AlertDescription>
            Your credit check is currently being processed. This may take a few minutes.
          </AlertDescription>
          {pendingChecks.map((check) => (
            <div key={check.id} className="flex justify-between items-center mt-4">
              <span className="text-sm">
                Requested: {formatDate(check.requestDate)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancelCreditCheck(check.id)}
                disabled={cancelCreditCheckMutation.isPending}
              >
                {cancelCreditCheckMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Cancel Request"
                )}
              </Button>
            </div>
          ))}
        </Alert>
      )}

      {/* Request Credit Check Section */}
      {!showForm && !pendingChecks.length && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Request a Credit Check</CardTitle>
            <CardDescription>
              {checkAvailability?.available
                ? "You already have a recent credit report. Do you want to request a new one?"
                : "Request a credit check to see your credit score and report"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              A credit check will help landlords assess your application and may improve your chances of being approved for a rental property.
            </p>
            {checkAvailability?.available && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Recent credit check available</AlertTitle>
                <AlertDescription>
                  You already have a credit check from the last 90 days. Requesting a new one may affect your credit score.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => setShowForm(true)}>
              {checkAvailability?.available ? "Request New Check" : "Request Credit Check"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Consent Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Credit Check Consent</CardTitle>
            <CardDescription>
              Please read and accept the terms below to proceed with your credit check
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Information</AlertTitle>
                <AlertDescription>
                  This will result in a "hard inquiry" on your credit report which may temporarily affect your credit score.
                </AlertDescription>
              </Alert>
              
              <div className="bg-muted p-4 rounded-md text-sm mb-4 max-h-48 overflow-y-auto">
                <h4 className="font-semibold mb-2">Credit Check Authorization</h4>
                <p className="mb-2">
                  I authorize Rentr and its partners to obtain my credit report and verify other credit information, including past and present mortgage and landlord references. It is understood that a copy of this form will serve as authorization.
                </p>
                <p className="mb-2">
                  By checking the consent box below, I understand the following:
                </p>
                <ul className="list-disc list-inside space-y-1 mb-2">
                  <li>A hard credit inquiry will be performed which may affect my credit score</li>
                  <li>My information will be used only for rental application purposes</li>
                  <li>The information obtained will be stored securely in accordance with privacy laws</li>
                  <li>The credit check will be processed by Equifax, a trusted third-party credit bureau</li>
                  <li>Results will be available within 1-2 business days</li>
                </ul>
                <p>
                  I understand that I have the right to dispute the information contained in the credit report by contacting the credit reporting agency directly.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent"
                  checked={consentProvided}
                  onCheckedChange={(checked) => setConsentProvided(!!checked)}
                />
                <Label htmlFor="consent" className="text-sm">
                  I consent to the terms and authorize Rentr to obtain my credit report
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              disabled={!consentProvided || requestCreditCheckMutation.isPending}
              onClick={handleRequestCreditCheck}
            >
              {requestCreditCheckMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Request Credit Check"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Credit Check History */}
      {creditChecks && creditChecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Credit Check History</CardTitle>
            <CardDescription>
              View your previous credit check requests and results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {creditChecks.map((check) => (
                <div key={check.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-1">
                        {check.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : check.status === "pending" ? (
                          <Clock className="h-4 w-4 text-amber-500 mr-2" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className="font-medium">
                          {check.status === "completed"
                            ? "Completed"
                            : check.status === "pending"
                            ? "Processing"
                            : "Failed"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Requested: {formatDate(check.requestDate)}
                      </p>
                      {check.completedDate && (
                        <p className="text-sm text-muted-foreground">
                          Completed: {formatDate(check.completedDate)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {check.status === "completed" && (
                        <div>
                          <span className="text-xl font-bold">{check.score}</span>
                          <p className="text-xs text-muted-foreground">Credit Score</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {check.status === "completed" && (
                    <div className="mt-4">
                      <Separator className="my-2" />
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Navigate to detailed view
                            // This could be implemented to show a modal or navigate to a detailed page
                            toast({
                              title: "View Details",
                              description: "Detailed view coming soon!",
                            });
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}