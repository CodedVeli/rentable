import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Application,
  Property
} from "@shared/schema";
import { Spinner } from "../../components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { demoApplications, demoProperties } from "@/utils/demo-data";

// Icons
import {
  Check,
  Clock,
  AlertTriangle,
  X,
  ChevronDown,
  FileText, 
  User,
  DollarSign,
  Home,
  Calendar,
  Star,
  Briefcase,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Building,
  Clock4,
  ExternalLink,
  AlignLeft,
  ChevronRight,
  Filter,
  Search,
  Plus
} from "lucide-react";

// Function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

// Component for application status badge
function ApplicationStatusBadge({ status }: { status: string }) {
  let variant: "default" | "destructive" | "outline" | "secondary" | "secondary" = "default";
  let icon = null;
  
  switch (status) {
    case "pending":
      variant = "secondary";
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    case "approved":
      variant = "default";
      icon = <Check className="h-3 w-3 mr-1" />;
      break;
    case "rejected":
      variant = "destructive";
      icon = <X className="h-3 w-3 mr-1" />;
      break;
    case "under_review":
      variant = "outline";
      icon = <AlertTriangle className="h-3 w-3 mr-1" />;
      break;
  }
  
  return (
    <Badge variant={variant} className="flex items-center">
      {icon}
      {status === "under_review" ? "Under Review" : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// Main tenant applications page component
export default function TenantApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [viewApplicationDialogOpen, setViewApplicationDialogOpen] = useState(false);
  const [newApplicationDialogOpen, setNewApplicationDialogOpen] = useState(false);
  
  // Fetch the tenant's applications (demo for now)
  const { data: applications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ["/api/applications"],
    queryFn: () => Promise.resolve(
      demoApplications
        .filter(app => app.tenantId === user?.id)
        .map(app => {
          const property = demoProperties.find(p => p.id === app.propertyId);
          return { ...app, property };
        })
    ),
    enabled: !!user && user.role === "tenant",
  });
  
  // Fetch available properties for new applications
  const { data: availableProperties, isLoading: isLoadingProperties } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: () => Promise.resolve(
      demoProperties.filter(p => p.status === "available")
    ),
    enabled: !!user && user.role === "tenant",
  });

  // Handle viewing application details
  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
    setViewApplicationDialogOpen(true);
  };

  // Function to withdraw an application
  const handleWithdrawApplication = (applicationId: number) => {
    toast({
      title: "Application withdrawn",
      description: "Your application has been successfully withdrawn.",
    });
    setViewApplicationDialogOpen(false);
  };

  // Handle new application button click
  const handleNewApplication = () => {
    setNewApplicationDialogOpen(true);
  };

  // Submit new application (would be a real API call in production)
  const handleSubmitApplication = () => {
    toast({
      title: "Application submitted",
      description: "Your application has been successfully submitted.",
    });
    setNewApplicationDialogOpen(false);
  };

  // Filter applications by status and search term
  const filteredApplications = React.useMemo(() => {
    if (!applications) return [];
    
    return applications.filter(app => {
      const matchesStatus = filterStatus === "all" || app.status === filterStatus;
      const matchesSearch = 
        app.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.property?.addressStreet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.property?.addressCity?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [applications, filterStatus, searchTerm]);
  
  if (isLoadingApplications) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Spinner />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-1">Manage your property applications and check their status</p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            onClick={handleNewApplication}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </div>
        
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search properties..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Applications list */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                {searchTerm || filterStatus !== "all" 
                  ? "Try changing your filters or search term" 
                  : "You haven't submitted any applications yet. Start by applying to an available property."}
              </p>
              <Button onClick={handleNewApplication}>Browse Available Properties</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Property Info */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="w-full md:w-24 h-24 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                        {application.property?.photos?.[0] ? (
                          <img 
                            src={application.property.photos[0]} 
                            alt={application.property.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{application.property?.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {application.property?.addressStreet}, {application.property?.addressCity}, {application.property?.addressProvince}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {application.property?.bedrooms} {application.property?.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {application.property?.bathrooms} {application.property?.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {application.property?.propertyType.charAt(0).toUpperCase() + application.property?.propertyType.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="font-medium">
                            {application.property?.monthlyRent 
                              ? formatCurrency(application.property.monthlyRent) + "/month" 
                              : "Price on request"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Application Status & Actions */}
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <ApplicationStatusBadge status={application.status as string} />
                      <p className="text-sm text-gray-500">
                        Applied on {format(new Date(application.createdAt as Date), "MMMM d, yyyy")}
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => handleViewApplication(application)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Application Details Dialog */}
      <Dialog open={viewApplicationDialogOpen} onOpenChange={setViewApplicationDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApplication?.property?.title} - Applied on {selectedApplication?.createdAt 
                ? format(new Date(selectedApplication.createdAt), "MMMM d, yyyy") 
                : "Unknown date"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Property Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-36 rounded-lg bg-gray-200 overflow-hidden">
                      {selectedApplication.property?.photos?.[0] ? (
                        <img 
                          src={selectedApplication.property.photos[0]} 
                          alt={selectedApplication.property.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold">{selectedApplication.property.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {selectedApplication.property.addressStreet}, {selectedApplication.property.addressCity}, {selectedApplication.property.addressProvince} {selectedApplication.property.addressPostalCode}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Property Type</p>
                        <p>{selectedApplication.property.propertyType.charAt(0).toUpperCase() + selectedApplication.property.propertyType.slice(1)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Monthly Rent</p>
                        <p className="font-medium">{formatCurrency(selectedApplication.property.monthlyRent || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bedrooms</p>
                        <p>{selectedApplication.property.bedrooms}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bathrooms</p>
                        <p>{selectedApplication.property.bathrooms}</p>
                      </div>
                    </div>
                    
                    {selectedApplication.property.amenities && (
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Amenities</p>
                        <p className="text-sm">{selectedApplication.property.amenities}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Application Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Application Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-500">Status</p>
                      <ApplicationStatusBadge status={selectedApplication.status} />
                    </div>
                    
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Income</p>
                      <p className="font-medium">{formatCurrency(selectedApplication.income || 0)}/year</p>
                    </div>
                    
                    {selectedApplication.creditCheck && (
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Credit Check</p>
                        <Badge variant="outline" className="flex items-center w-fit">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                          Included
                        </Badge>
                      </div>
                    )}
                    
                    {selectedApplication.references && selectedApplication.references.length > 0 && (
                      <div>
                        <p className="text-gray-500 text-sm mb-2">References</p>
                        <div className="space-y-2">
                          {selectedApplication.references.map((ref: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-3 text-sm">
                              <p className="font-medium">{ref.name}</p>
                              <p className="text-gray-600">{ref.relationship}</p>
                              <div className="flex flex-col mt-1">
                                <span>{ref.phone}</span>
                                <span>{ref.email}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedApplication.notes && (
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Notes</p>
                        <p className="text-sm">{selectedApplication.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                {selectedApplication.status === "pending" && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleWithdrawApplication(selectedApplication.id)}
                  >
                    Withdraw Application
                  </Button>
                )}
                <Button 
                  onClick={() => setViewApplicationDialogOpen(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* New Application Dialog */}
      <Dialog open={newApplicationDialogOpen} onOpenChange={setNewApplicationDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Apply for a Property</DialogTitle>
            <DialogDescription>
              Find a property and submit your application
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingProperties ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : availableProperties && availableProperties.length > 0 ? (
            <Tabs defaultValue="properties">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="properties">Select Property</TabsTrigger>
                <TabsTrigger value="application" disabled={!selectedApplication}>Apply</TabsTrigger>
              </TabsList>
              
              <TabsContent value="properties" className="space-y-4 pt-4">
                <div className="mb-4">
                  <Input
                    type="text"
                    placeholder="Search available properties..."
                    className="w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="space-y-4">
                    {availableProperties
                      .filter(property => 
                        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        property.addressStreet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        property.addressCity?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(property => (
                        <Card key={property.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="w-24 h-24 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                                {property.photos?.[0] ? (
                                  <img 
                                    src={property.photos[0]} 
                                    alt={property.title} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Building className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="text-base font-semibold">{property.title}</h3>
                                <p className="text-gray-600 text-sm mb-1">
                                  {property.addressStreet}, {property.addressCity}
                                </p>
                                <div className="flex flex-wrap gap-1 mb-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                                  </span>
                                </div>
                                <p className="font-medium text-sm">
                                  {property.monthlyRent 
                                    ? formatCurrency(property.monthlyRent) + "/month" 
                                    : "Price on request"}
                                </p>
                              </div>
                              
                              <div className="flex items-center">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedApplication({ property })}
                                >
                                  Select
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="application" className="space-y-6 pt-4">
                {selectedApplication && selectedApplication.property && (
                  <>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Property Details</CardTitle>
                        <CardDescription>{selectedApplication.property.title}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm">{selectedApplication.property.addressStreet}, {selectedApplication.property.addressCity}, {selectedApplication.property.addressProvince}</p>
                        <p className="text-sm font-medium">{formatCurrency(selectedApplication.property.monthlyRent || 0)}/month</p>
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Annual Income</label>
                        <Input type="text" placeholder="80,000" />
                        <p className="text-xs text-gray-500">We recommend your annual income is at least 30x monthly rent</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notes (Optional)</label>
                        <Textarea 
                          placeholder="Include any additional information that might be relevant to your application"
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="creditCheck" checked />
                          <label
                            htmlFor="creditCheck"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Include credit check with application
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 ml-6">
                          This will allow the landlord to verify your credit history as part of the approval process
                        </p>
                      </div>
                    </div>
                    
                    <Button className="w-full" onClick={handleSubmitApplication}>
                      Submit Application
                    </Button>
                  </>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500 mb-4">No available properties found at this time.</p>
              <Button variant="outline" onClick={() => setNewApplicationDialogOpen(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}