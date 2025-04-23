import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertTriangle, 
  User, 
  Mail, 
  Phone, 
  Home,
  CreditCard,
  ArrowUpRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TenantCreditCheckPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Define types for better TypeScript support
  interface Application {
    id: number;
    tenantId: number;
    propertyId: number;
    status: string;
    // Add other application properties as needed
  }
  
  interface Tenant {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    creditScore?: number;
    // Add other tenant properties as needed
  }
  
  interface CreditReport {
    scoreFactors: string[];
    summary?: {
      totalAccounts: number;
      openAccounts: number;
      closedAccounts: number;
      delinquentAccounts: number;
      totalBalance: number;
      totalMonthlyPayments: number;
      utilization: number;
    };
    tradelines?: {
      accountType: string;
      balance: number;
      openDate: string;
      paymentStatus: string;
      creditorName?: string;
      creditLimit?: number;
    }[];
  }
  
  interface CreditCheck {
    id: number;
    userId: number;
    status: "pending" | "completed" | "failed" | "cancelled";
    requestDate: string;
    completedDate?: string;
    referenceId?: string;
    score?: number;
    report?: CreditReport;
  }

  // Get all applications for this landlord
  const { data: applications, isLoading: isLoadingApplications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user && user.role === "landlord",
  });

  // Get tenants who have applied to this landlord's properties
  const { data: tenants, isLoading: isLoadingTenants } = useQuery<Tenant[]>({
    queryKey: ["/api/users/tenants"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user && user.role === "landlord",
  });

  // Get credit check for the selected tenant
  const { data: creditChecks, isLoading: isLoadingCreditChecks } = useQuery<CreditCheck[]>({
    queryKey: ["/api/credit-checks", selectedTenantId],
    queryFn: async () => {
      if (!selectedTenantId) return [];
      const res = await apiRequest("GET", `/api/users/${selectedTenantId}/credit-checks`);
      return res.json();
    },
    enabled: !!selectedTenantId,
  });

  const filteredTenants = tenants
    ? tenants.filter(
        (tenant: Tenant) =>
          tenant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tenant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get most recent completed check
  const getMostRecentCompletedCheck = (checks: CreditCheck[] | undefined): CreditCheck | null => {
    if (!checks || checks.length === 0) return null;
    
    return checks
      .filter((check: CreditCheck) => check.status === "completed")
      .sort((a: CreditCheck, b: CreditCheck) => {
        const dateA = new Date(a.completedDate || a.requestDate);
        const dateB = new Date(b.completedDate || b.requestDate);
        return dateB.getTime() - dateA.getTime();
      })[0];
  };

  const recentCheck = creditChecks ? getMostRecentCompletedCheck(creditChecks) : null;

  if (isLoadingApplications || isLoadingTenants) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-6">Tenant Credit Checks</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Tenant List */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Tenants</CardTitle>
              <CardDescription>
                Select a tenant to view their credit information
              </CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </CardHeader>
            <CardContent>
              {tenants && tenants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tenants found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {filteredTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors hover:bg-muted ${
                        selectedTenantId === tenant.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedTenantId(tenant.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">
                            {tenant.firstName} {tenant.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {tenant.email}
                          </div>
                        </div>
                        {tenant.creditScore && (
                          <Badge variant="outline">
                            Score: {tenant.creditScore}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Credit Check Info */}
        <div className="md:col-span-2">
          {selectedTenantId ? (
            isLoadingCreditChecks ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : creditChecks && creditChecks.length > 0 ? (
              <Tabs defaultValue="report" className="h-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="report">Credit Report</TabsTrigger>
                  <TabsTrigger value="history">Credit History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="report" className="h-full">
                  {recentCheck ? (
                    <Card className="h-full">
                      <CardHeader className="bg-muted/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Credit Report</CardTitle>
                            <CardDescription>
                              {formatDate(recentCheck.completedDate || recentCheck.requestDate)}
                            </CardDescription>
                          </div>
                          <Badge variant={
                            recentCheck.score < 600
                              ? "destructive"
                              : recentCheck.score < 660
                              ? "outline"
                              : recentCheck.score < 725
                              ? "secondary"
                              : "default"
                          }>
                            {recentCheck.score < 600
                              ? "Poor"
                              : recentCheck.score < 660
                              ? "Fair"
                              : recentCheck.score < 725
                              ? "Good"
                              : recentCheck.score < 760
                              ? "Very Good"
                              : "Excellent"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex-1">
                            <div className="text-center mb-6">
                              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-6 mb-4">
                                <span className="text-4xl font-bold text-primary">
                                  {recentCheck.score || "N/A"}
                                </span>
                              </div>
                            </div>
                            
                            <h3 className="font-semibold mb-2">Credit Factors</h3>
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
                                  <span>Closed Accounts:</span>
                                  <span>{recentCheck.report.summary.closedAccounts}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Delinquent Accounts:</span>
                                  <span>{recentCheck.report.summary.delinquentAccounts}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total Balance:</span>
                                  <span>${recentCheck.report.summary.totalBalance.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Monthly Payments:</span>
                                  <span>${recentCheck.report.summary.totalMonthlyPayments.toLocaleString()}</span>
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
                            
                            <Separator className="my-4" />
                            
                            <h3 className="font-semibold mb-2">Credit Accounts</h3>
                            {recentCheck.report?.tradelines && recentCheck.report.tradelines.length > 0 ? (
                              <div className="space-y-3">
                                {recentCheck.report.tradelines.map((tradeline, i) => (
                                  <div key={i} className="text-sm border rounded-md p-2">
                                    <div className="flex justify-between">
                                      <span className="font-medium">{tradeline.accountType}</span>
                                      <Badge variant={
                                        tradeline.paymentStatus === "Current" ? "outline" : "destructive"
                                      }>
                                        {tradeline.paymentStatus}
                                      </Badge>
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      {tradeline.creditorName} • Opened {tradeline.openDate}
                                    </div>
                                    <div className="mt-2 flex justify-between">
                                      <span>Balance: ${tradeline.balance.toLocaleString()}</span>
                                      {tradeline.creditLimit && (
                                        <span>Limit: ${tradeline.creditLimit.toLocaleString()}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No account details available
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between bg-muted/30">
                        <div className="text-sm text-muted-foreground">
                          <span>Reference ID: {recentCheck.referenceId}</span>
                        </div>
                        <Button variant="outline" onClick={() => window.print()}>
                          <FileText className="mr-2 h-4 w-4" />
                          Print Report
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>No Credit Report Available</CardTitle>
                        <CardDescription>
                          This tenant does not have a completed credit check
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center justify-center py-8">
                          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-center text-muted-foreground">
                            There is no credit report available for this tenant.
                            The tenant must initiate a credit check from their dashboard.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Credit Check History</CardTitle>
                      <CardDescription>
                        All credit checks for this tenant
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {creditChecks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No credit check history found</p>
                        </div>
                      ) : (
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
                                  {check.status === "completed" && check.score && (
                                    <div>
                                      <span className="text-xl font-bold">{check.score}</span>
                                      <p className="text-xs text-muted-foreground">Credit Score</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>No Credit Checks</CardTitle>
                  <CardDescription>
                    This tenant has not requested any credit checks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-center text-muted-foreground mb-4">
                      There are no credit checks for this tenant.
                      The tenant must initiate a credit check from their dashboard.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Credit Information</CardTitle>
                <CardDescription>
                  Select a tenant to view their credit information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-16">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground">
                    Please select a tenant from the list to view their credit information
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}