import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn } from "@/lib/queryClient";
import { 
  User,
  TenantScore,
  Property
} from "@shared/schema";

// Define custom interface types since they aren't in the schema yet
interface Application {
  id: number;
  tenantId: number;
  propertyId: number;
  status: string;
  income: number;
  createdAt: Date;
  references?: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  }[];
  notes?: string;
}

interface CreditCheck {
  id: number;
  userId: number;
  status: string;
  score?: number;
  consentProvided: boolean;
  requestDate: Date;
  completedDate?: Date;
  report?: {
    scoreFactors?: string[];
    summary?: {
      totalAccounts: number;
      openAccounts: number;
      closedAccounts: number;
      delinquentAccounts: number;
      totalBalance: number;
      totalMonthlyPayments: number;
      utilization: number;
    };
  };
}
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { demoApplications } from "@/utils/demo-data";
import { Spinner } from "@/components/ui/spinner";

// Icons
import {
  Check,
  Clock,
  Search,
  X,
  ChevronDown,
  FileText, 
  User as UserIcon,
  DollarSign,
  Home,
  Calendar,
  Star,
  Briefcase,
  Shield,
  Users,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Filter,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ZoomIn,
  CreditCard,
} from "lucide-react";

// Demo tenants
const demoTenants: Partial<User>[] = [
  {
    id: 2,
    firstName: "Emily",
    lastName: "Johnson",
    email: "emily.johnson@example.com",
    phoneNumber: "+1 (416) 555-1234",
    profileImage: null,
    role: "tenant",
    createdAt: new Date("2025-01-15"),
    verificationStatus: "verified",
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Williams",
    email: "michael.williams@example.com",
    phoneNumber: "+1 (647) 555-5678",
    profileImage: null,
    role: "tenant",
    createdAt: new Date("2025-02-03"),
    verificationStatus: "pending",
  },
  {
    id: 4,
    firstName: "Sarah",
    lastName: "Lee",
    email: "sarah.lee@example.com",
    phoneNumber: "+1 (905) 555-9012",
    profileImage: null,
    role: "tenant",
    createdAt: new Date("2025-02-10"),
    verificationStatus: "verified",
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@example.com",
    phoneNumber: "+1 (437) 555-3456",
    profileImage: null,
    role: "tenant",
    createdAt: new Date("2025-01-25"),
    verificationStatus: "unverified",
  },
  {
    id: 6,
    firstName: "Jessica",
    lastName: "Garcia",
    email: "jessica.garcia@example.com",
    phoneNumber: "+1 (416) 555-7890",
    profileImage: null,
    role: "tenant",
    createdAt: new Date("2025-02-15"),
    verificationStatus: "verified",
  }
];

// Demo credit checks
const demoCreditChecks: Partial<CreditCheck>[] = [
  {
    id: 1,
    userId: 2,
    status: "completed",
    score: 765,
    consentProvided: true,
    requestDate: new Date("2025-02-01"),
    completedDate: new Date("2025-02-02"),
    report: {
      scoreFactors: [
        "Length of credit history is favorable",
        "Low utilization of available credit",
        "No recent missed payments"
      ],
      summary: {
        totalAccounts: 5,
        openAccounts: 3,
        closedAccounts: 2,
        delinquentAccounts: 0,
        totalBalance: 1200000, // $12,000.00
        totalMonthlyPayments: 80000, // $800.00
        utilization: 15 // 15%
      }
    }
  },
  {
    id: 2,
    userId: 3,
    status: "completed",
    score: 690,
    consentProvided: true,
    requestDate: new Date("2025-02-03"),
    completedDate: new Date("2025-02-04"),
    report: {
      scoreFactors: [
        "Recent credit inquiries have affected score",
        "Higher than average credit card utilization",
        "Short credit history"
      ],
      summary: {
        totalAccounts: 4,
        openAccounts: 4,
        closedAccounts: 0,
        delinquentAccounts: 0,
        totalBalance: 2250000, // $22,500.00
        totalMonthlyPayments: 120000, // $1,200.00
        utilization: 32 // 32%
      }
    }
  },
  {
    id: 3,
    userId: 4,
    status: "completed",
    score: 820,
    consentProvided: true,
    requestDate: new Date("2025-01-20"),
    completedDate: new Date("2025-01-21"),
    report: {
      scoreFactors: [
        "Excellent payment history",
        "Long credit history",
        "Diverse mix of credit accounts",
        "Low total balances relative to limits"
      ],
      summary: {
        totalAccounts: 8,
        openAccounts: 5,
        closedAccounts: 3,
        delinquentAccounts: 0,
        totalBalance: 1850000, // $18,500.00
        totalMonthlyPayments: 75000, // $750.00
        utilization: 10 // 10%
      }
    }
  },
  {
    id: 4,
    userId: 5,
    status: "pending",
    consentProvided: true,
    requestDate: new Date("2025-02-15"),
  },
  {
    id: 5,
    userId: 6,
    status: "completed",
    score: 740,
    consentProvided: true,
    requestDate: new Date("2025-02-10"),
    completedDate: new Date("2025-02-11"),
    report: {
      scoreFactors: [
        "Good payment history",
        "Moderate length of credit history",
        "Recent new account opened"
      ],
      summary: {
        totalAccounts: 6,
        openAccounts: 4,
        closedAccounts: 2,
        delinquentAccounts: 0,
        totalBalance: 2100000, // $21,000.00
        totalMonthlyPayments: 115000, // $1,150.00
        utilization: 22 // 22%
      }
    }
  }
];

// Demo tenant scores
const demoTenantScores: Partial<TenantScore>[] = [
  {
    id: 1,
    tenantId: 2,
    overallScore: 91,
    creditScore: 92,
    incomeToRentRatio: 94,
    rentalHistory: 88,
    employmentStability: 95,
    identityVerificationScore: 100,
    referenceScore: 90,
    applicationQualityScore: 85,
    paymentHistoryScore: 90,
    promptnessScore: 85,
    evictionHistoryScore: 100,
    criminalCheckScore: 100,
    scoringMethod: "comprehensive",
    scoredAt: new Date("2025-02-05")
  },
  {
    id: 2,
    tenantId: 3,
    overallScore: 78,
    creditScore: 76,
    incomeToRentRatio: 85,
    rentalHistory: 75,
    employmentStability: 80,
    identityVerificationScore: 80,
    referenceScore: 85,
    applicationQualityScore: 75,
    paymentHistoryScore: 75,
    promptnessScore: 70,
    evictionHistoryScore: 100,
    criminalCheckScore: 100,
    scoringMethod: "comprehensive",
    scoredAt: new Date("2025-02-05")
  },
  {
    id: 3,
    tenantId: 4,
    overallScore: 96,
    creditScore: 98,
    incomeToRentRatio: 95,
    rentalHistory: 96,
    employmentStability: 98,
    identityVerificationScore: 100,
    referenceScore: 95,
    applicationQualityScore: 90,
    paymentHistoryScore: 98,
    promptnessScore: 95,
    evictionHistoryScore: 100,
    criminalCheckScore: 100,
    scoringMethod: "comprehensive",
    scoredAt: new Date("2025-01-22")
  },
  {
    id: 5,
    tenantId: 6,
    overallScore: 88,
    creditScore: 86,
    incomeToRentRatio: 90,
    rentalHistory: 85,
    employmentStability: 92,
    identityVerificationScore: 100,
    referenceScore: 85,
    applicationQualityScore: 88,
    paymentHistoryScore: 85,
    promptnessScore: 82,
    evictionHistoryScore: 100,
    criminalCheckScore: 100,
    scoringMethod: "comprehensive",
    scoredAt: new Date("2025-02-12")
  }
];

// Demo properties
const demoProperties: Partial<Property>[] = [
  {
    id: 1,
    title: "Modern Downtown Condo",
    addressStreet: "123 King Street West",
    addressCity: "Toronto",
    addressProvince: "ON",
    addressPostalCode: "M5V 1J2",
    propertyType: "condo",
    bedrooms: 2,
    bathrooms: 2,
    priceMonthly: 240000, // $2,400.00
  },
  {
    id: 2,
    title: "Spacious Midtown Apartment",
    addressStreet: "456 Yonge Street",
    addressCity: "Toronto",
    addressProvince: "ON",
    addressPostalCode: "M4Y 1X8",
    propertyType: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    priceMonthly: 195000, // $1,950.00
  },
  {
    id: 3,
    title: "Family Home in High Park",
    addressStreet: "789 Parkside Drive",
    addressCity: "Toronto",
    addressProvince: "ON",
    addressPostalCode: "M6R 2Z8",
    propertyType: "house",
    bedrooms: 3,
    bathrooms: 2,
    priceMonthly: 320000, // $3,200.00
  },
  {
    id: 4,
    title: "East End Townhouse",
    addressStreet: "321 Broadview Avenue",
    addressCity: "Toronto",
    addressProvince: "ON",
    addressPostalCode: "M4K 2G6",
    propertyType: "townhouse",
    bedrooms: 2,
    bathrooms: 1.5,
    priceMonthly: 265000, // $2,650.00
  }
];

// Enhanced demo applications 
const enhancedDemoApplications = demoApplications.map(app => {
  // Find the tenant for this application
  const tenant = demoTenants.find(t => t.id === app.tenantId);
  // Find the property for this application
  const property = demoProperties.find(p => p.id === app.propertyId);
  // Find the credit check for this tenant
  const creditCheck = demoCreditChecks.find(c => c.userId === app.tenantId);
  // Find the tenant score for this tenant
  const tenantScore = demoTenantScores.find(s => s.tenantId === app.tenantId);
  
  return {
    ...app,
    tenant,
    property,
    creditCheck,
    tenantScore,
    submittedDate: app.createdAt
  };
});

// Component for displaying the tenant score/match
function TenantMatchScore({ score }: { score?: number }) {
  if (!score) return null;
  
  let colorClass = "";
  if (score >= 90) colorClass = "bg-green-500";
  else if (score >= 80) colorClass = "bg-green-400";
  else if (score >= 70) colorClass = "bg-yellow-400";
  else if (score >= 60) colorClass = "bg-yellow-500";
  else colorClass = "bg-red-500";
  
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm font-medium">{score}% Match</div>
      <div className="h-2.5 w-full rounded-full bg-gray-200">
        <div 
          className={`h-2.5 rounded-full ${colorClass}`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
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
  }
  
  return (
    <Badge variant={variant} className="flex items-center">
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// Component for credit score meter
function CreditScoreMeter({ score }: { score?: number }) {
  if (!score) return <div className="text-sm text-gray-500">No credit score available</div>;
  
  let scoreCategory = "";
  let colorClass = "";
  
  if (score >= 800) {
    scoreCategory = "Excellent";
    colorClass = "text-green-600";
  } else if (score >= 740) {
    scoreCategory = "Very Good";
    colorClass = "text-green-500";
  } else if (score >= 670) {
    scoreCategory = "Good";
    colorClass = "text-yellow-500";
  } else if (score >= 580) {
    scoreCategory = "Fair";
    colorClass = "text-orange-500";
  } else {
    scoreCategory = "Poor";
    colorClass = "text-red-500";
  }
  
  const percentage = Math.min(Math.max((score - 300) / (850 - 300) * 100, 0), 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm font-medium">{score}</span>
        <span className={`text-sm font-medium ${colorClass}`}>{scoreCategory}</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex justify-between text-xs text-gray-500">
        <span>300</span>
        <span>850</span>
      </div>
    </div>
  );
}

// Function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

// Function to calculate income-to-rent ratio
function calculateIncomeToRentRatio(income?: number, rent?: number): string {
  if (!income || !rent || rent === 0) return "N/A";
  
  const ratio = Math.round((income / rent) * 10) / 10;
  return `${ratio}x`;
}

// Main applications page component
export default function LandlordApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("submittedDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [viewApplicationDialogOpen, setViewApplicationDialogOpen] = useState(false);
  
  // Fetch applications (in real app, this would come from the API)
  const { data: applications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ["/api/applications"],
    queryFn: () => Promise.resolve(enhancedDemoApplications), // Replace with real API call
    enabled: !!user && user.role === "landlord",
  });
  
  // This would be a real API call in the production app
  const handleApproveApplication = (applicationId: number) => {
    toast({
      title: "Application approved",
      description: "The tenant has been notified.",
    });
    setViewApplicationDialogOpen(false);
  };
  
  // This would be a real API call in the production app
  const handleRejectApplication = (applicationId: number) => {
    toast({
      title: "Application rejected",
      description: "The tenant has been notified.",
    });
    setViewApplicationDialogOpen(false);
  };
  
  // Filter and sort applications
  const filteredApplications = React.useMemo(() => {
    if (!applications) return [];
    
    return applications
      .filter(app => {
        const matchesSearch = 
          app.tenant?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.tenant?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.property?.addressStreet?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || app.status === statusFilter;
        const matchesProperty = propertyFilter === "all" || app.propertyId?.toString() === propertyFilter;
        
        return matchesSearch && matchesStatus && matchesProperty;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === "submittedDate") {
          comparison = new Date(b.submittedDate || 0).getTime() - new Date(a.submittedDate || 0).getTime();
        } else if (sortBy === "tenantName") {
          const nameA = `${a.tenant?.firstName || ""} ${a.tenant?.lastName || ""}`.toLowerCase();
          const nameB = `${b.tenant?.firstName || ""} ${b.tenant?.lastName || ""}`.toLowerCase();
          comparison = nameA.localeCompare(nameB);
        } else if (sortBy === "propertyTitle") {
          const titleA = a.property?.title?.toLowerCase() || "";
          const titleB = b.property?.title?.toLowerCase() || "";
          comparison = titleA.localeCompare(titleB);
        } else if (sortBy === "score") {
          comparison = (b.tenantScore?.overallScore || 0) - (a.tenantScore?.overallScore || 0);
        }
        
        return sortOrder === "asc" ? comparison * -1 : comparison;
      });
  }, [applications, searchTerm, statusFilter, propertyFilter, sortBy, sortOrder]);
  
  // Handle viewing application details
  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
    setViewApplicationDialogOpen(true);
  };
  
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
            <h1 className="text-2xl font-bold text-gray-900">Tenant Applications</h1>
            <p className="text-gray-600 mt-1">Review and manage rental applications from prospective tenants.</p>
          </div>
        </div>
        
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by name or property"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Property</label>
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {demoProperties.map((property) => (
                      <SelectItem key={property.id} value={property.id?.toString() || ""}>
                        {property.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sort By</label>
                <Select 
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [by, order] = value.split('-');
                    setSortBy(by);
                    setSortOrder(order);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submittedDate-desc">Latest First</SelectItem>
                    <SelectItem value="submittedDate-asc">Oldest First</SelectItem>
                    <SelectItem value="tenantName-asc">Tenant Name (A-Z)</SelectItem>
                    <SelectItem value="tenantName-desc">Tenant Name (Z-A)</SelectItem>
                    <SelectItem value="propertyTitle-asc">Property Name (A-Z)</SelectItem>
                    <SelectItem value="propertyTitle-desc">Property Name (Z-A)</SelectItem>
                    <SelectItem value="score-desc">Highest Score First</SelectItem>
                    <SelectItem value="score-asc">Lowest Score First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="mb-2 text-lg font-semibold">No applications found</p>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredApplications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {application.tenant?.firstName?.[0] || ''}
                          {application.tenant?.lastName?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="text-lg font-medium">
                          {application.tenant?.firstName} {application.tenant?.lastName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <ApplicationStatusBadge status={application.status || "pending"} />
                          <span className="mx-1">•</span>
                          <span>Applied {application.submittedDate ? format(new Date(application.submittedDate), "MMM d, yyyy") : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 md:mt-0">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Property</p>
                        <p className="font-medium">{application.property?.title || "N/A"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Income to Rent</p>
                        <p className="font-medium flex items-center">
                          {calculateIncomeToRentRatio(application.income, application.property?.monthlyRent)}
                          {application.income && 
                            (application.income / 12) >= 3 * (application.property?.priceMonthly ? (application.property.priceMonthly / 100) : 2000) ? 
                            <CheckCircle className="h-4 w-4 ml-1.5 text-green-500" /> : 
                            <XCircle className="h-4 w-4 ml-1.5 text-amber-500" />
                          }
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Credit Score</p>
                        <p className="font-medium flex items-center">
                          {application.creditCheck?.score || "Not available"}
                          {application.creditCheck?.score && 
                            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                              application.creditCheck.score >= 700 ? "bg-green-100 text-green-800" :
                              application.creditCheck.score >= 600 ? "bg-amber-100 text-amber-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {application.creditCheck.score >= 700 ? "Excellent" :
                               application.creditCheck.score >= 600 ? "Good" : "Fair"}
                            </span>
                          }
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Tenant Score</p>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{application.tenantScore?.overallScore || "N/A"}</span>
                          {application.tenantScore?.overallScore && 
                            <div className="relative h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`absolute top-0 left-0 h-full ${
                                  application.tenantScore.overallScore >= 80 ? "bg-green-500" :
                                  application.tenantScore.overallScore >= 60 ? "bg-amber-500" :
                                  "bg-red-500"
                                }`}
                                style={{ width: `${application.tenantScore.overallScore}%` }}
                              />
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end mt-6 md:mt-0">
                      <div className="w-full md:w-40 mb-2">
                        <TenantMatchScore score={application.tenantScore?.overallScore} />
                      </div>
                      <Button variant="outline" onClick={() => handleViewApplication(application)}>
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
      
      {/* Application Detail Dialog */}
      <Dialog open={viewApplicationDialogOpen} onOpenChange={setViewApplicationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedApplication?.submittedDate 
                ? format(new Date(selectedApplication.submittedDate), "MMMM d, yyyy") 
                : "N/A"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left column - tenant info */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Tenant profile */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Tenant Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-primary/10 text-primary text-xl">
                            {selectedApplication.tenant?.firstName?.[0] || ''}
                            {selectedApplication.tenant?.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h3 className="text-xl font-medium">
                            {selectedApplication.tenant?.firstName} {selectedApplication.tenant?.lastName}
                          </h3>
                          <p className="text-gray-500">{selectedApplication.tenant?.email}</p>
                          <p className="text-gray-500">{selectedApplication.tenant?.phoneNumber}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Tenant Profile Photos */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Profile Photos</h4>
                          <Badge variant="outline">Required for verification</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="relative aspect-square rounded-md overflow-hidden border bg-muted/20">
                              <div className="flex items-center justify-center h-full">
                                <UserIcon className="h-8 w-8 text-muted-foreground/50" />
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                                <p className="text-white text-xs font-medium p-2">Profile Photo</p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <ZoomIn className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">View</span>
                              </Button>
                              <Badge variant="outline" className="h-6 text-xs bg-amber-50 text-amber-700 border-amber-200">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="relative aspect-square rounded-md overflow-hidden border bg-muted/20">
                              <div className="flex items-center justify-center h-full">
                                <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                                <p className="text-white text-xs font-medium p-2">ID Card</p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <ZoomIn className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">View</span>
                              </Button>
                              <Badge variant="outline" className="h-6 text-xs bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="relative aspect-square rounded-md overflow-hidden border bg-muted/20">
                              <div className="flex items-center justify-center h-full">
                                <FileText className="h-8 w-8 text-muted-foreground/50" />
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                                <p className="text-white text-xs font-medium p-2">Proof of Income</p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <ZoomIn className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">View</span>
                              </Button>
                              <Badge variant="outline" className="h-6 text-xs bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Employment</p>
                          <p className="font-medium">Product Manager at Shopify</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Monthly Income</p>
                          <p className="font-medium">{formatCurrency(selectedApplication.income || 0)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Account Created</p>
                          <p className="font-medium">
                            {selectedApplication.tenant?.createdAt 
                              ? format(new Date(selectedApplication.tenant.createdAt), "MMM d, yyyy") 
                              : "N/A"}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Verification Status</p>
                          <div className="flex items-center">
                            {selectedApplication.tenant?.verificationStatus === "verified" ? (
                              <Badge variant="default" className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : selectedApplication.tenant?.verificationStatus === "pending" ? (
                              <Badge variant="secondary" className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center">
                                <XCircle className="h-3 w-3 mr-1" />
                                Not Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Credit check */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Credit Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedApplication.creditCheck?.status === "completed" ? (
                        <div className="space-y-4">
                          <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-1">Credit Score</p>
                            <CreditScoreMeter score={selectedApplication.creditCheck?.score} />
                          </div>
                          
                          <Separator />
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Total Accounts</p>
                              <p className="font-medium">
                                {selectedApplication.creditCheck?.report?.summary?.totalAccounts || "N/A"}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Total Balance</p>
                              <p className="font-medium">
                                {selectedApplication.creditCheck?.report?.summary?.totalBalance
                                  ? formatCurrency(selectedApplication.creditCheck.report.summary.totalBalance)
                                  : "N/A"}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Monthly Payments</p>
                              <p className="font-medium">
                                {selectedApplication.creditCheck?.report?.summary?.totalMonthlyPayments
                                  ? formatCurrency(selectedApplication.creditCheck.report.summary.totalMonthlyPayments)
                                  : "N/A"}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Utilization</p>
                              <p className="font-medium">
                                {selectedApplication.creditCheck?.report?.summary?.utilization
                                  ? `${selectedApplication.creditCheck.report.summary.utilization}%`
                                  : "N/A"}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Delinquent Accounts</p>
                              <p className="font-medium">
                                {selectedApplication.creditCheck?.report?.summary?.delinquentAccounts ?? "N/A"}
                              </p>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Score Factors</p>
                            <ul className="space-y-1">
                              {selectedApplication.creditCheck?.report?.scoreFactors?.map((factor: string, index: number) => (
                                <li key={index} className="text-sm flex items-start">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {factor}
                                </li>
                              )) || <p className="text-sm">No score factors available</p>}
                            </ul>
                          </div>
                        </div>
                      ) : selectedApplication.creditCheck?.status === "pending" ? (
                        <div className="py-4 text-center">
                          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-lg font-medium text-gray-700">Credit check in progress</p>
                          <p className="text-gray-500">
                            Requested on {selectedApplication.creditCheck?.requestDate
                              ? format(new Date(selectedApplication.creditCheck.requestDate), "MMM d, yyyy")
                              : "N/A"}
                          </p>
                        </div>
                      ) : (
                        <div className="py-4 text-center">
                          <XCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-lg font-medium text-gray-700">No credit check available</p>
                          <p className="text-gray-500">The tenant has not completed a credit check yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* References */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">References</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedApplication.references && selectedApplication.references.length > 0 ? (
                        <div className="space-y-4">
                          {selectedApplication.references.map((reference: any, index: number) => (
                            <div key={index} className="p-4 rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-medium">{reference.name}</h4>
                                  <p className="text-sm text-gray-500">{reference.relationship}</p>
                                </div>
                                <Badge variant="outline">
                                  {reference.relationship === "Previous Landlord" ? "Landlord Reference" : "Professional Reference"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <p>Phone: {reference.phone}</p>
                                <p>Email: {reference.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center">
                          <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-lg font-medium text-gray-700">No references provided</p>
                          <p className="text-gray-500">The tenant has not supplied any references.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Application notes */}
                  {selectedApplication.notes && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Application Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{selectedApplication.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                {/* Right column - property and tenant score */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Property details */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Property Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium text-lg">{selectedApplication.property?.title}</h3>
                        <p className="text-gray-500">
                          {selectedApplication.property?.addressStreet}, {selectedApplication.property?.addressCity}, {selectedApplication.property?.addressProvince} {selectedApplication.property?.addressPostalCode}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Property Type</p>
                          <p className="font-medium capitalize">{selectedApplication.property?.propertyType}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Monthly Rent</p>
                          <p className="font-medium">
                            {selectedApplication.property?.priceMonthly
                              ? formatCurrency(selectedApplication.property.priceMonthly)
                              : "N/A"}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Bedrooms</p>
                          <p className="font-medium">{selectedApplication.property?.bedrooms}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Bathrooms</p>
                          <p className="font-medium">{selectedApplication.property?.bathrooms}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Income to Rent Ratio</p>
                        <div className="flex items-center">
                          <div className="text-xl font-bold">
                            {calculateIncomeToRentRatio(selectedApplication.income, selectedApplication.property?.priceMonthly)}
                          </div>
                          <div className="ml-2 text-sm text-gray-500">
                            (
                              {selectedApplication.income
                                ? formatCurrency(selectedApplication.income)
                                : "N/A"} income
                              ÷ 
                              {selectedApplication.property?.priceMonthly
                                ? formatCurrency(selectedApplication.property.priceMonthly)
                                : "N/A"} rent
                            )
                          </div>
                        </div>
                        <p className="text-sm mt-1">
                          {selectedApplication.income && selectedApplication.property?.priceMonthly && 
                           (selectedApplication.income / selectedApplication.property.priceMonthly) >= 3
                            ? "Good income to rent ratio (3x or more is typically desired)"
                            : "Income to rent ratio is below the recommended 3x threshold"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Tenant score */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Tenant Match Score</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedApplication.tenantScore ? (
                        <>
                          <div className="flex justify-center items-center mb-4">
                            <div className="relative h-32 w-32">
                              <svg className="h-full w-full" viewBox="0 0 100 100">
                                <circle
                                  className="text-gray-200 stroke-current"
                                  strokeWidth="10"
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="transparent"
                                />
                                <circle
                                  className="text-primary stroke-current"
                                  strokeWidth="10"
                                  strokeLinecap="round"
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="transparent"
                                  strokeDasharray={`${2.51 * 40 * (selectedApplication.tenantScore.overallScore / 100)} ${
                                    2.51 * 40
                                  }`}
                                  strokeDashoffset={0}
                                  transform="rotate(-90 50 50)"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-bold">{selectedApplication.tenantScore.overallScore}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <p className="text-sm">Credit Score</p>
                                <p className="text-sm font-medium">{selectedApplication.tenantScore.creditScore}%</p>
                              </div>
                              <Progress value={selectedApplication.tenantScore.creditScore} className="h-1.5" />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <p className="text-sm">Income Ratio</p>
                                <p className="text-sm font-medium">{selectedApplication.tenantScore.incomeToRentRatio}%</p>
                              </div>
                              <Progress value={selectedApplication.tenantScore.incomeToRentRatio} className="h-1.5" />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <p className="text-sm">Rental History</p>
                                <p className="text-sm font-medium">{selectedApplication.tenantScore.rentalHistory}%</p>
                              </div>
                              <Progress value={selectedApplication.tenantScore.rentalHistory} className="h-1.5" />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <p className="text-sm">Employment</p>
                                <p className="text-sm font-medium">{selectedApplication.tenantScore.employmentStability}%</p>
                              </div>
                              <Progress value={selectedApplication.tenantScore.employmentStability} className="h-1.5" />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <p className="text-sm">References</p>
                                <p className="text-sm font-medium">{selectedApplication.tenantScore.referenceScore}%</p>
                              </div>
                              <Progress value={selectedApplication.tenantScore.referenceScore} className="h-1.5" />
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                            <p>Scored on {selectedApplication.tenantScore.scoredAt
                              ? format(new Date(selectedApplication.tenantScore.scoredAt), "MMM d, yyyy")
                              : "N/A"}
                            </p>
                            <p>Method: {selectedApplication.tenantScore.scoringMethod === "comprehensive" 
                              ? "Comprehensive Analysis" 
                              : selectedApplication.tenantScore.scoringMethod}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="py-4 text-center">
                          <XCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-lg font-medium text-gray-700">No tenant score available</p>
                          <p className="text-gray-500">A tenant score has not been generated yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Application action buttons */}
                  {selectedApplication.status === "pending" && (
                    <div className="flex gap-4">
                      <Button 
                        className="flex-1" 
                        onClick={() => handleApproveApplication(selectedApplication.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approve Application
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => handleRejectApplication(selectedApplication.id)}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Reject Application
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}