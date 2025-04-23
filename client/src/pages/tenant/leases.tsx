import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import { useToast } from "@/hooks/use-toast";
import { demoLeases, demoProperties } from "@/utils/demo-data";
import { 
  FileText, 
  Home, 
  Calendar, 
  DollarSign, 
  Download, 
  Clock, 
  Info, 
  Check, 
  AlertCircle,
  Eye,
  Search,
  RefreshCw,
  FileCheck,
  ChevronRight,
  CreditCard,
  MessageSquare,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import type { Lease, Property } from "@shared/schema";

export default function TenantLeases() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewLeaseDialogOpen, setViewLeaseDialogOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  
  // Fetch leases
  const { data: leases = [], isLoading: isLoadingLeases } = useQuery<Lease[]>({
    queryKey: ['/api/leases', user?.id],
    enabled: !!user,
    queryFn: async () => {
      try {
        const response = await fetch(`/api/leases?tenantId=${user?.id}`);
        if (!response.ok) throw new Error('Failed to fetch leases');
        return await response.json();
      } catch (error) {
        console.error('Falling back to demo data:', error);
        // Return demo leases filtered for this tenant
        return demoLeases
          .filter(lease => lease.tenantId === user?.id)
          .map(lease => ({
            ...lease,
            property: demoProperties.find(p => p.id === lease.propertyId)
          }));
      }
    }
  });
  
  // Fetch properties separately if needed
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ['/api/properties', user?.id],
    enabled: !!user && leases.length > 0,
    queryFn: async () => {
      try {
        // Get the property IDs from the leases
        const propertyIds = leases.map(lease => lease.propertyId);
        // Fetch properties matching those IDs
        const response = await fetch(`/api/properties?ids=${propertyIds.join(',')}`);
        if (!response.ok) throw new Error('Failed to fetch properties');
        return await response.json();
      } catch (error) {
        console.error('Falling back to demo properties:', error);
        // Get properties from the demo data that match the lease property IDs
        const propertyIds = leases.map(lease => lease.propertyId);
        return demoProperties.filter(property => propertyIds.includes(property.id));
      }
    }
  });
  
  // Add property details to each lease for easier rendering
  const leasesWithProperties = leases.map(lease => {
    const property = properties.find(p => p.id === lease.propertyId);
    return { ...lease, property };
  });
  
  // Filter leases based on active tab and search term
  const filteredLeases = leasesWithProperties.filter(lease => {
    // Filter by tab
    if (
      (activeTab === "active" && lease.status !== "active") ||
      (activeTab === "upcoming" && lease.status !== "pending") ||
      (activeTab === "expired" && !["expired", "terminated"].includes(lease.status))
    ) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        lease.property?.title?.toLowerCase().includes(searchLower) ||
        lease.property?.addressCity?.toLowerCase().includes(searchLower) ||
        lease.property?.addressStreet?.toLowerCase().includes(searchLower) ||
        lease.status.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Sort leases by start date (most recent first)
  const sortedLeases = [...filteredLeases].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return dateB - dateA;
  });
  
  // Function to view lease details
  const handleViewLease = (lease: Lease) => {
    setSelectedLease(lease);
    setViewLeaseDialogOpen(true);
  };
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Get the remaining days in the lease
  const getRemainingDays = (lease: Lease) => {
    if (lease.status !== "active") return null;
    
    const endDate = new Date(lease.endDate);
    const today = new Date();
    
    // If the lease has already ended
    if (endDate < today) return 0;
    
    const diffTime = Math.abs(endDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Calculate the percentage of time elapsed in the lease
  const getLeaseProgress = (lease: Lease) => {
    const startDate = new Date(lease.startDate);
    const endDate = new Date(lease.endDate);
    const today = new Date();
    
    // If the lease hasn't started yet
    if (today < startDate) return 0;
    
    // If the lease has already ended
    if (today > endDate) return 100;
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();
    
    return Math.min(100, Math.round((elapsedDuration / totalDuration) * 100));
  };
  
  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "pending":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "expired":
        return <Badge>Expired</Badge>;
      case "terminated":
        return <Badge variant="destructive">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 md:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Leases</h1>
            <p className="text-gray-600 mt-1">Manage your rental agreements</p>
          </div>
        </div>
        
        {/* Tabs and Search */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="active">
                <Check className="h-4 w-4 mr-2" />
                Active
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="expired">
                <Clock className="h-4 w-4 mr-2" />
                Past
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search leases by property or address..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Active Lease Alert */}
        {activeTab === "active" && sortedLeases.length > 0 && sortedLeases[0].status === "active" && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lease Renewal Coming Up</AlertTitle>
            <AlertDescription>
              {getRemainingDays(sortedLeases[0]) && getRemainingDays(sortedLeases[0])! < 60 ? (
                <>
                  Your lease for <span className="font-medium">{sortedLeases[0].property?.title}</span> expires in{" "}
                  <span className="font-medium">{getRemainingDays(sortedLeases[0])} days</span>. Consider renewing soon.
                </>
              ) : (
                <>
                  You have an active lease for <span className="font-medium">{sortedLeases[0].property?.title}</span>{" "}
                  until <span className="font-medium">{formatDate(sortedLeases[0].endDate)}</span>.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Leases Grid/Table */}
        {isLoadingLeases ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="h-6 bg-gray-200 animate-pulse w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 animate-pulse w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 animate-pulse w-full" />
                    <div className="h-4 bg-gray-200 animate-pulse w-full" />
                    <div className="h-4 bg-gray-200 animate-pulse w-3/4" />
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="h-9 bg-gray-200 animate-pulse w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : sortedLeases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedLeases.map(lease => (
              <Card key={lease.id} className="overflow-hidden">
                <div className="relative h-1.5">
                  <div 
                    className={`absolute inset-0 bg-${lease.status === "active" ? "primary" : lease.status === "pending" ? "secondary" : "gray-400"}`}
                    style={{ width: `${getLeaseProgress(lease)}%` }}
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{lease.property?.title || "Unnamed Property"}</CardTitle>
                    {getStatusBadge(lease.status)}
                  </div>
                  <CardDescription className="flex items-center">
                    <Home className="h-3.5 w-3.5 mr-1 text-gray-500" />
                    {lease.property?.addressStreet}, {lease.property?.addressCity}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Monthly Rent</p>
                      <p className="text-lg font-semibold">{formatCurrency(lease.monthlyRent)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deposit</p>
                      <p className="text-lg font-semibold">{formatCurrency(lease.depositAmount)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="text-sm font-medium">{formatDate(lease.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="text-sm font-medium">{formatDate(lease.endDate)}</p>
                    </div>
                  </div>
                  
                  {lease.status === "active" && getRemainingDays(lease) !== null && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Lease Progress</span>
                        <span>{getRemainingDays(lease)} days remaining</span>
                      </div>
                      <Progress value={getLeaseProgress(lease)} />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleViewLease(lease)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  
                  <div className="flex gap-2">
                    {lease.status === "active" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tenant/payment-checkout?leaseId=${lease.id}`}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Rent
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/messages?landlordId=${lease.landlordId}`}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Leases Found</CardTitle>
              <CardDescription>
                {activeTab === "active" 
                  ? "You don't have any active leases at the moment."
                  : activeTab === "upcoming"
                    ? "You don't have any upcoming leases."
                    : "You don't have any past leases."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center max-w-md mb-6">
                {activeTab === "active" 
                  ? "Apply for properties to start your rental journey."
                  : activeTab === "upcoming"
                    ? "Your lease agreements will appear here once they're signed but before they start."
                    : "Your expired or terminated leases will be shown here for record keeping."}
              </p>
              {activeTab === "active" && (
                <Button asChild>
                  <Link href="/tenant/properties">
                    <Home className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Lease Details Dialog */}
        <Dialog open={viewLeaseDialogOpen} onOpenChange={setViewLeaseDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Lease Details</DialogTitle>
              <DialogDescription>
                View the full details of your lease agreement
              </DialogDescription>
            </DialogHeader>
            
            {selectedLease && (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{selectedLease.property?.title}</h3>
                  {getStatusBadge(selectedLease.status)}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Home className="h-4 w-4 mr-1" />
                  {selectedLease.property?.addressStreet}, {selectedLease.property?.addressCity}, {selectedLease.property?.addressState} {selectedLease.property?.addressZip}
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Lease Term</h4>
                    <p>{formatDate(selectedLease.startDate)} to {formatDate(selectedLease.endDate)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Monthly Rent</h4>
                    <p className="font-semibold">{formatCurrency(selectedLease.monthlyRent)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Security Deposit</h4>
                    <p>{formatCurrency(selectedLease.depositAmount)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Payment Due Date</h4>
                    <p>1st of each month</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Lease Terms</h4>
                  <div className="text-sm p-3 bg-gray-50 rounded-md">
                    {selectedLease.leaseTerms || "No specific terms documented."}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Property Details</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Bedrooms:</span>{" "}
                      <span className="font-medium">{selectedLease.property?.bedrooms}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Bathrooms:</span>{" "}
                      <span className="font-medium">{selectedLease.property?.bathrooms}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Size:</span>{" "}
                      <span className="font-medium">{selectedLease.property?.squareFeet} sq ft</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>{" "}
                      <span className="font-medium">{selectedLease.property?.propertyType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pets:</span>{" "}
                      <span className="font-medium">{selectedLease.property?.petsAllowed ? "Allowed" : "Not allowed"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Furnished:</span>{" "}
                      <span className="font-medium">{selectedLease.property?.isFurnished ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" asChild>
                <Link href="/documents" onClick={() => setViewLeaseDialogOpen(false)}>
                  <FileCheck className="h-4 w-4 mr-2" />
                  View Signed Document
                </Link>
              </Button>
              <Button asChild>
                <Link 
                  href={`/messages?landlordId=${selectedLease?.landlordId}`}
                  onClick={() => setViewLeaseDialogOpen(false)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Landlord
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}