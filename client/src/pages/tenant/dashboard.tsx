import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import StatsOverview from "@/components/dashboard/stats-overview";
import Notifications from "@/components/dashboard/notifications";
import RecentActivity from "@/components/dashboard/recent-activity";
import PropertyListings from "@/components/dashboard/property-listings";
import TenantScoreAnalysis from "@/components/dashboard/tenant-score-analysis";
import TenantScoreTab from "@/components/tabs/tenant-score-tab";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { demoProperties, demoPayments, demoLeases, demoRecentActivities, demoApplications } from "@/utils/demo-data";
import { 
  Building, 
  Home, 
  FileText, 
  ClipboardList, 
  PlusCircle, 
  ChevronRight, 
  Calendar, 
  CreditCard, 
  BadgeCheck,
  Award,
  Search,
  DollarSign,
  BellRing,
  Wallet,
  FilterX,
  CircleCheck,
  CircleAlert,
  Star,
  MapPin,
  Filter,
  Bell,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Property, Payment, Lease } from "@shared/schema";
import type { StatsOverviewProps } from "@/components/dashboard/stats-overview";

export default function TenantDashboard() {
  const { user } = useAuth();
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch real properties instead of using demo data
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch real payments
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/payments'],
    staleTime: 5 * 60 * 1000,
  });
  
  // Fetch real leases
  const { data: leasesData, isLoading: leasesLoading } = useQuery({
    queryKey: ['/api/leases'],
    staleTime: 5 * 60 * 1000,
  });
  
  // Fetch real viewings for this tenant
  const { data: viewingsData, isLoading: viewingsLoading } = useQuery({
    queryKey: ['/api/viewings'],
    staleTime: 5 * 60 * 1000,
  });
  
  // Fetch real tenant score analysis
  const { data: scoreAnalysisData, isLoading: scoreAnalysisLoading } = useQuery({
    queryKey: ['/api/tenant-scores', user?.id, 'analysis'],
    staleTime: 5 * 60 * 1000,
    enabled: !!user?.id
  });

  // Use real data if available, fall back to demo data if needed
  const myRentedProperties = propertiesData?.filter((p: any) => p.tenantId === user?.id) || 
    demoProperties.filter(p => p.tenantId === user?.id).map(p => ({ ...p })) as Property[];
    
  const availableProperties = propertiesData?.filter((p: any) => !p.tenantId && p.status === "available") || 
    demoProperties.filter(p => !p.tenantId && p.status === "available").map(p => ({ ...p })) as Property[];
    
  // Get all properties to show, combining rented and available
  const allPropertiesToShow = [...myRentedProperties, ...availableProperties];
  
  // Filter properties based on search and filters
  const filteredProperties = allPropertiesToShow.filter(property => {
    // Filter by search term
    const matchesSearch = searchTerm === "" || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.addressCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by property type
    const matchesType = propertyFilter === "all" || 
      (propertyFilter === "rented" && property.tenantId === user?.id) ||
      (propertyFilter === "available" && !property.tenantId && property.status === "available");
    
    // Filter by price range
    const matchesPrice = property.monthlyRent >= priceRange.min && 
      property.monthlyRent <= priceRange.max;
    
    return matchesSearch && matchesType && matchesPrice;
  });
  
  // Payments and leases data processing
  const myPayments = paymentsData?.filter((p: any) => p.tenantId === user?.id) || 
    demoPayments.filter(p => p.tenantId === user?.id).map(p => ({ ...p })) as Payment[];
    
  const myLeases = leasesData?.filter((l: any) => l.tenantId === user?.id) || 
    demoLeases.filter(l => l.tenantId === user?.id).map(l => ({ ...l })) as Lease[];
  
  // Get my applications from demo data (would come from a real API in production)
  const myApplications = demoApplications
    .filter(app => app.tenantId === user?.id)
    .map(app => ({ ...app }));
    
  // Calculate upcoming payments (from the next 30 days)
  const currentDate = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(currentDate.getDate() + 30);
  
  const upcomingPayments = myPayments
    .filter(payment => {
      if (payment.status !== "pending") return false;
      if (!payment.dueDate) return true; // If no due date, show it
      const dueDate = new Date(payment.dueDate);
      return dueDate <= thirtyDaysFromNow;
    })
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 3);
    
  // Format the tenant score for display
  const tenantScore = scoreAnalysisData?.score?.overallScore || 0;
  const scoreBadgeColor = 
    tenantScore >= 80 ? "text-green-600" : 
    tenantScore >= 60 ? "text-yellow-600" : 
    "text-red-600";
  
  // Get upcoming scheduled viewings (next 7 days)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(currentDate.getDate() + 7);
  
  // Create a fallback for viewings if the API fails
  const demoViewings = [
    {
      id: 1001,
      propertyId: demoProperties[0]?.id || 1,
      tenantId: user?.id,
      landlordId: demoProperties[0]?.landlordId || 1,
      status: "scheduled",
      scheduledDate: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      notes: "Please arrive 10 minutes early",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 1002,
      propertyId: demoProperties[1]?.id || 2,
      tenantId: user?.id,
      landlordId: demoProperties[1]?.landlordId || 1,
      status: "scheduled",
      scheduledDate: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      notes: "Virtual viewing via Zoom",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  const upcomingViewings = viewingsData?.filter((v: any) => {
    if (v.tenantId !== user?.id) return false;
    if (v.status !== "scheduled") return false;
    if (!v.scheduledDate) return false;
    const viewingDate = new Date(v.scheduledDate);
    return viewingDate >= currentDate && viewingDate <= sevenDaysFromNow;
  }) || demoViewings;
  
  // Calculate days until next payment
  const nextPaymentDueDate = upcomingPayments.length > 0 && upcomingPayments[0].dueDate
    ? new Date(upcomingPayments[0].dueDate) 
    : null;
  
  const daysUntilNextPayment = nextPaymentDueDate 
    ? Math.max(0, Math.ceil((nextPaymentDueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // Calculate active lease information  
  const activeLeases = myLeases.filter(lease => lease.status === "active");
  const currentLease = activeLeases.length > 0 ? activeLeases[0] : null;
  
  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 md:px-8">
        {/* Dashboard Header with Welcome and Profile Summary */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName || user?.username}!</h1>
            <p className="text-gray-600 mt-1">Manage your rental journey and find your perfect home</p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" asChild className="px-3 hover:bg-primary/5">
                    <Link href="/tenant/score">
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>My Tenant Score</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" asChild className="px-3 hover:bg-primary/5">
                    <Link href="/messages">
                      <Bell className="h-4 w-4 text-primary" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Messages</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" asChild className="px-3 hover:bg-primary/5">
                    <Link href="/documents">
                      <FileText className="h-4 w-4 text-primary" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>My Documents</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button variant="outline" asChild>
              <Link href="/tenant/applications">
                <ClipboardList className="h-4 w-4 mr-2" />
                My Applications
              </Link>
            </Button>
            <Button asChild>
              <Link href="/tenant/properties">
                <Search className="h-4 w-4 mr-2" />
                Find Properties
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Action Alert for Critical Items */}
        {upcomingPayments.length > 0 && daysUntilNextPayment !== null && daysUntilNextPayment < 3 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Due Soon!</AlertTitle>
            <AlertDescription>
              You have a payment of ${(upcomingPayments[0].amount / 100).toFixed(2)} due in {daysUntilNextPayment} {daysUntilNextPayment === 1 ? 'day' : 'days'}. 
              <Button variant="link" asChild className="p-0 h-auto ml-2">
                <Link href={`/tenant/payment-checkout?id=${upcomingPayments[0].id}`}>
                  Pay Now
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Quick Access Action Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Score</p>
                <div className="flex items-center mt-1">
                  <span className={`text-2xl font-bold ${scoreBadgeColor}`}>
                    {scoreAnalysisLoading ? "--" : tenantScore}
                  </span>
                  <Badge className="ml-2" variant={tenantScore >= 80 ? "default" : tenantScore >= 60 ? "outline" : "destructive"}>
                    {tenantScore >= 80 ? "Excellent" : 
                     tenantScore >= 70 ? "Good" : 
                     tenantScore >= 60 ? "Fair" : 
                     "Needs Work"}
                  </Badge>
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Award className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Next Payment</p>
                <div className="flex flex-col mt-1">
                  <span className="text-2xl font-bold">
                    {nextPaymentDueDate ? (
                      <span className={daysUntilNextPayment !== null && daysUntilNextPayment < 3 ? "text-red-600" : ""}>
                        {daysUntilNextPayment} {daysUntilNextPayment === 1 ? 'day' : 'days'}
                      </span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </span>
                  {nextPaymentDueDate && (
                    <span className="text-xs text-gray-500">
                      Due: {nextPaymentDueDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Properties</p>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold">
                    {propertiesLoading ? "--" : myRentedProperties.length}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    Rented
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <Home className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Viewings</p>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold">
                    {viewingsLoading ? "--" : upcomingViewings.length}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    Scheduled
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="properties" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="properties">
              <Home className="h-4 w-4 mr-2" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="rental-score">
              <Award className="h-4 w-4 mr-2" />
              Tenant Score
            </TabsTrigger>
            <TabsTrigger value="applications">
              <ClipboardList className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="payments">
              <DollarSign className="h-4 w-4 mr-2" />
              Payments & Documents
            </TabsTrigger>
          </TabsList>
          
          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Search properties by name, city, or features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="rented">My Rentals</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => {
                  setSearchTerm("");
                  setPropertyFilter("all");
                  setPriceRange({ min: 0, max: 10000 });
                }}>
                  <FilterX className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {propertiesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* Current Lease Summary (if any) */}
                  {currentLease && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Home className="mr-2 h-5 w-5 text-primary" />
                          Current Lease
                        </CardTitle>
                        <CardDescription>
                          Your active rental agreement details
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Property</p>
                            <p className="font-medium">
                              {myRentedProperties.find(p => p.id === currentLease.propertyId)?.title || "Unknown Property"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Monthly Rent</p>
                            <p className="font-medium">${(currentLease.monthlyRent / 100).toFixed(2)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Lease Period</p>
                            <p className="font-medium">
                              {new Date(currentLease.startDate).toLocaleDateString()} - {new Date(currentLease.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">Time Remaining</p>
                              <p className="font-medium">
                                {Math.ceil((new Date(currentLease.endDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))} days
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/documents?leaseId=${currentLease.id}`}>
                                <FileText className="h-4 w-4 mr-2" />
                                View Lease Document
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {filteredProperties.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium">
                          {propertyFilter === "rented" 
                            ? "My Current Properties" 
                            : propertyFilter === "available" 
                              ? "Available Properties" 
                              : "All Properties"
                          }
                        </h3>
                        <Badge variant="outline">
                          {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
                        </Badge>
                      </div>
                      <PropertyListings
                        properties={filteredProperties}
                        showAddPropertyCard={false}
                      />
                    </>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>No Properties Found</CardTitle>
                        <CardDescription>
                          {searchTerm || propertyFilter !== "all" 
                            ? "Try adjusting your filters or search term to see more properties"
                            : "Start your search to find your perfect home"
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center py-6">
                        <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                          {searchTerm || propertyFilter !== "all" 
                            ? "No properties match your current filters."
                            : "No properties are currently available or rented by you."
                          }
                        </p>
                      </CardContent>
                      <CardFooter className="flex flex-col xs:flex-row gap-2 justify-center">
                        {(searchTerm || propertyFilter !== "all") && (
                          <Button variant="outline" onClick={() => {
                            setSearchTerm("");
                            setPropertyFilter("all");
                          }}>
                            <FilterX className="h-4 w-4 mr-2" />
                            Clear Filters
                          </Button>
                        )}
                        <Button asChild>
                          <Link href="/tenant/properties">
                            <Search className="h-4 w-4 mr-2" />
                            Find Properties
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TabsContent>
          
          {/* Tenant Score Tab */}
          <TabsContent value="rental-score" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Tenant Score Overview</CardTitle>
                        <CardDescription>Your rental profile rating</CardDescription>
                      </div>
                      
                      {/* Circular progress indicator for score */}
                      <div className="relative">
                        <svg className="w-16 h-16" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={
                              tenantScore >= 80 ? "#10b981" : 
                              tenantScore >= 60 ? "#f59e0b" : 
                              "#ef4444"
                            }
                            strokeWidth="8"
                            strokeDasharray="251.3"
                            strokeDashoffset={(251.3 - (251.3 * tenantScore) / 100)}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                          <text
                            x="50"
                            y="55"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className={`${scoreBadgeColor} font-bold text-xl`}
                          >
                            {scoreAnalysisLoading ? "--" : tenantScore}
                          </text>
                        </svg>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {scoreAnalysisLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Score Strength</span>
                              <span className={scoreBadgeColor}>
                                {tenantScore >= 80 ? "Excellent" : 
                                 tenantScore >= 70 ? "Good" : 
                                 tenantScore >= 60 ? "Fair" : 
                                 "Needs Improvement"}
                              </span>
                            </div>
                            <Progress 
                              value={tenantScore} 
                              className={`h-2 ${
                                tenantScore >= 80 ? "bg-green-600" : 
                                tenantScore >= 60 ? "bg-yellow-600" : 
                                "bg-red-600"
                              }`} 
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {scoreAnalysisData && [
                              { label: "Payment History", value: scoreAnalysisData.score.paymentHistory, icon: <CreditCard className="h-4 w-4" /> },
                              { label: "Income Stability", value: scoreAnalysisData.score.incomeStability, icon: <Wallet className="h-4 w-4" /> },
                              { label: "Credit Score", value: scoreAnalysisData.score.creditScore, icon: <BadgeCheck className="h-4 w-4" /> },
                              { label: "Rental History", value: scoreAnalysisData.score.rentalHistory, icon: <Home className="h-4 w-4" /> }
                            ].map((item, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors">
                                <div className="text-sm text-gray-500 mb-1 flex items-center">
                                  <span className="mr-1.5 text-gray-600">{item.icon}</span>
                                  {item.label}
                                </div>
                                <div className="flex items-center">
                                  <span className="text-lg font-medium">{item.value}/100</span>
                                  <Progress 
                                    value={item.value} 
                                    className={`h-1.5 ml-2 flex-grow ${
                                      item.value >= 80 ? "bg-green-600" : 
                                      item.value >= 60 ? "bg-yellow-600" : 
                                      "bg-red-600"
                                    }`} 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" className="w-full mr-2" asChild>
                      <Link href="/tenant/score">
                        View Detailed Analysis
                      </Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/tenant/score/improve">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Improve My Score
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <TenantScoreAnalysis />
              </div>
            </div>
            
            {scoreAnalysisData?.recommendations?.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Recommendations to Improve Your Score</CardTitle>
                  <CardDescription>Follow these steps to increase your tenant score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scoreAnalysisData.recommendations.map((rec, i) => (
                      <div key={i} className="border px-4 py-3 rounded-md">
                        <h4 className="font-medium mb-1 flex items-center">
                          {rec.type === 'high' ? <CircleAlert className="h-4 w-4 mr-2 text-primary" /> : 
                           rec.type === 'medium' ? <AlertCircle className="h-4 w-4 mr-2 text-primary" /> : 
                           <CircleCheck className="h-4 w-4 mr-2 text-primary" />}
                          {rec.message}
                        </h4>
                        <ul className="text-sm space-y-1 mt-2 pl-6 list-disc">
                          {rec.actionItems.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>My Applications</CardTitle>
                    <CardDescription>Track the status of your rental applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myApplications.length > 0 ? (
                      <div className="space-y-4">
                        {myApplications.map((app, idx) => {
                          const property = demoProperties.find(p => p.id === app.propertyId);
                          return (
                            <div key={idx} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                              <div className="flex items-center">
                                <div className="rounded-md p-2 mr-3 bg-gray-100">
                                  <ClipboardList className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{property?.title}</p>
                                  <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <Badge variant={
                                      app.status === 'approved' ? 'default' : 
                                      app.status === 'pending' ? 'outline' : 
                                      'destructive'
                                    }>
                                      {app.status === 'approved' ? 'Approved' : 
                                       app.status === 'pending' ? 'Pending' : 
                                       'Rejected'}
                                    </Badge>
                                    <span className="ml-2 text-sm flex items-center">
                                      <Clock className="h-3.5 w-3.5 mr-1" />
                                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/tenant/applications/${app.id}`}>
                                  Details
                                </Link>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">You haven't submitted any rental applications yet.</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col xs:flex-row gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/tenant/applications">
                        View All Applications
                      </Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/tenant/properties">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Apply for a Property
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Application Tips Card */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-base">Application Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3 pb-6">
                  <div className="flex items-start">
                    <CircleCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p>Complete all fields in your application for a higher chance of approval</p>
                  </div>
                  <div className="flex items-start">
                    <CircleCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p>Provide references from previous landlords when possible</p>
                  </div>
                  <div className="flex items-start">
                    <CircleCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p>Upload proof of income and employment verification documents</p>
                  </div>
                  <div className="flex items-start">
                    <CircleCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p>Respond quickly to any follow-up questions from landlords</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Payments & Documents Tab */}
          <TabsContent value="payments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                    Upcoming Payments
                  </CardTitle>
                  <CardDescription>Payments due in the next 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : upcomingPayments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingPayments.map((payment, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                          <div className="flex items-center">
                            <div className="rounded-md p-2 mr-3 bg-gray-100">
                              <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{payment.description || 'Rent Payment'}</p>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Badge 
                                  variant={payment.dueDate && new Date(payment.dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) ? "destructive" : "outline"} 
                                  className="mr-2"
                                >
                                  Due: {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'Not set'}
                                </Badge>
                                <span className="font-medium">
                                  ${(payment.amount / 100).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant={payment.dueDate && new Date(payment.dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) ? "default" : "outline"}
                            asChild
                          >
                            <Link href={`/tenant/payment-checkout?id=${payment.id}`}>
                              Pay Now
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No upcoming payments due.</p>
                      <p className="text-sm text-gray-400 mt-2">You're all caught up!</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/tenant/payments">
                      View Payment History
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    My Documents
                  </CardTitle>
                  <CardDescription>Lease agreements and important documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myLeases.filter(lease => lease.status === "active").slice(0, 3).map((lease, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center">
                          <div className="rounded-md bg-gray-100 p-2 mr-3">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Lease Agreement</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                Valid until: {new Date(lease.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/documents">
                            View
                          </Link>
                        </Button>
                      </div>
                    ))}
                    
                    {/* Add sample document for reference */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center">
                        <div className="rounded-md bg-gray-100 p-2 mr-3">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Rental Reference</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span>Uploaded: {new Date().toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/documents">
                          View
                        </Link>
                      </Button>
                    </div>
                    
                    {myLeases.filter(lease => lease.status === "active").length === 0 && myLeases.length === 0 && (
                      <div className="text-center py-2">
                        <p className="text-gray-500 text-sm">No active lease agreements.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col xs:flex-row gap-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/documents">
                      View All Documents
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/documents/upload">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Upload Document
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Upcoming Viewings with Interactive Calendar */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <CardTitle>Upcoming Viewings</CardTitle>
                      <CardDescription>Property viewings scheduled in the next 7 days</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary hover:bg-primary/10">
                    {upcomingViewings.length} {upcomingViewings.length === 1 ? 'viewing' : 'viewings'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {viewingsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingViewings.length > 0 ? (
                  <div className="space-y-4">
                    {/* Calendar timeline visualization */}
                    <div className="mb-6 border rounded-lg p-4 overflow-hidden">
                      <h3 className="text-sm font-medium mb-3">7-Day Viewing Schedule</h3>
                      <div className="relative">
                        <div className="grid grid-cols-7 gap-1 mb-1">
                          {Array.from({ length: 7 }).map((_, index) => {
                            const day = new Date();
                            day.setDate(currentDate.getDate() + index);
                            const dayOfWeek = day.toLocaleDateString('en-US', { weekday: 'short' });
                            const dayOfMonth = day.getDate();
                            
                            // Check if there are any viewings on this day
                            const hasViewings = upcomingViewings.some(v => {
                              const vDate = new Date(v.scheduledDate);
                              return vDate.getDate() === day.getDate() && 
                                     vDate.getMonth() === day.getMonth() && 
                                     vDate.getFullYear() === day.getFullYear();
                            });
                            
                            return (
                              <div 
                                key={index} 
                                className={`flex flex-col items-center p-1 rounded-md ${
                                  index === 0 ? 'bg-primary/20' : 
                                  hasViewings ? 'bg-yellow-50' : 'bg-gray-50'
                                }`}
                              >
                                <span className="text-xs font-medium">{dayOfWeek}</span>
                                <span className={`text-sm ${index === 0 ? 'font-bold' : ''}`}>{dayOfMonth}</span>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="h-20 relative border-t border-gray-200 mt-2 pt-2">
                          {upcomingViewings.map((viewing, idx) => {
                            const viewingDate = new Date(viewing.scheduledDate);
                            const daysDiff = Math.floor((viewingDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
                            
                            // Calculate positioning based on day number (0-6) and time
                            const leftPosition = `calc(${(daysDiff / 7) * 100}% + ${daysDiff * 0.5}rem)`;
                            const topPosition = (viewingDate.getHours() - 8) * 4; // Approximate time positioning
                            
                            // Get property details
                            const property = demoProperties.find(p => p.id === viewing.propertyId) 
                              || {title: 'Unknown Property', addressStreet: '', addressCity: ''};
                            
                            return (
                              <TooltipProvider key={idx}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div 
                                      className="absolute h-8 bg-yellow-200 rounded-md px-1 border border-yellow-400 cursor-pointer flex items-center text-xs font-medium"
                                      style={{ 
                                        left: leftPosition, 
                                        top: `${topPosition}%`,
                                        width: '6rem',
                                        zIndex: daysDiff === 0 ? 10 : 5
                                      }}
                                    >
                                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                                        {viewingDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="p-0 overflow-hidden w-60">
                                    <div className="p-3">
                                      <p className="font-medium">{property.title}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {property.addressStreet}, {property.addressCity}
                                      </p>
                                      <div className="flex items-center mt-2 text-xs">
                                        <Clock className="h-3 w-3 mr-1 text-primary" />
                                        {viewingDate.toLocaleDateString()} at {viewingDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </div>
                                    </div>
                                    <div className="bg-gray-50 p-2 border-t flex justify-end">
                                      <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                                        <Link href={`/tenant/viewings/${viewing.id}`}>
                                          View Details
                                        </Link>
                                      </Button>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Viewing cards */}
                    {upcomingViewings.map((viewing: any, idx: number) => {
                      const property = demoProperties.find(p => p.id === viewing.propertyId) 
                        || {title: 'Unknown Property', addressStreet: '', addressCity: ''};
                      const viewingDate = new Date(viewing.scheduledDate);
                      
                      // Calculate how many days away
                      const daysDiff = Math.floor((viewingDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
                      const dayText = daysDiff === 0 ? 'Today' : 
                                      daysDiff === 1 ? 'Tomorrow' : 
                                      `In ${daysDiff} days`;
                      
                      // Format time
                      const timeText = viewingDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      
                      return (
                        <div 
                          key={idx} 
                          className={`flex flex-col rounded-lg border overflow-hidden ${
                            daysDiff === 0 ? 'bg-primary/5 border-primary/20' : ''
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`rounded-full w-10 h-10 flex items-center justify-center
                                ${daysDiff === 0 ? 'bg-primary/20 text-primary' : 'bg-gray-100'}
                              `}>
                                <Calendar className="h-5 w-5" />
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between">
                                  <h4 className="font-medium">{property.title}</h4>
                                  <Badge variant={daysDiff === 0 ? "default" : "outline"} className={daysDiff === 0 ? "bg-primary" : ""}>
                                    {dayText}
                                  </Badge>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 sm:gap-x-4 mt-1 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                    {viewingDate.toLocaleDateString()} at {timeText}
                                  </span>
                                  <span className="flex items-center">
                                    <MapPin className="h-3.5 w-3.5 mr-1" />
                                    {property.addressStreet}, {property.addressCity}
                                  </span>
                                </div>
                                {viewing.notes && (
                                  <div className="mt-3 text-sm bg-white bg-opacity-50 p-2 rounded border border-gray-100">
                                    <p className="text-gray-600">{viewing.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="px-4 py-3 bg-gray-50 border-t flex flex-wrap gap-2 justify-end">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`https://maps.google.com/?q=${encodeURIComponent(`${property.addressStreet}, ${property.addressCity}`)}`} target="_blank">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                Map
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/tenant/properties/${property.id}`}>
                                <Home className="h-3.5 w-3.5 mr-1" />
                                Property
                              </Link>
                            </Button>
                            <Button size="sm" asChild>
                              <Link href={`/tenant/viewings/${viewing.id}`}>
                                Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No viewings scheduled for the next 7 days.</p>
                    <p className="text-sm text-gray-400 mt-2">Browse properties to schedule a viewing</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col xs:flex-row gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/tenant/properties">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Viewing
                  </Link>
                </Button>
                <Button variant="default" className="w-full" asChild>
                  <Link href="/tenant/viewings">
                    <Search className="h-4 w-4 mr-2" />
                    View All Properties
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest activity on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity
                  activities={demoRecentActivities.filter(a => 
                    a.link.startsWith('/tenant') || a.type === "payment"
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Custom Notifications Panel with Priority Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Notifications />
          </div>
          
          <div>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle className="text-lg">Messages & Notifications</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary">
                    2 New
                  </Badge>
                </div>
              </CardHeader>

              <Tabs defaultValue="messages" className="w-full">
                <div className="px-6 pt-2">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="messages">
                      <Bell className="h-3.5 w-3.5 mr-1.5" />
                      Messages
                    </TabsTrigger>
                    <TabsTrigger value="reminders">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      Reminders
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="messages" className="space-y-4 mt-0">
                  <ScrollArea className="h-[240px] px-2">
                    <div className="space-y-3 pt-2 pr-4 pl-2">
                      <div className="flex items-start gap-3 pb-3 border-b border-gray-200 bg-white p-3 rounded-lg shadow-sm">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 relative">
                          <span>JD</span>
                          <span className="absolute -top-1 -right-1 bg-primary w-3 h-3 rounded-full border-2 border-white"></span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">John Doe (Landlord)</p>
                            <p className="text-xs text-gray-500">Today, 9:12 AM</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">Maintenance request update</p>
                          <p className="text-sm mt-1">I'll send someone to look at that leak tomorrow morning. Please be available between 9-11am.</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Reply</Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                              <CircleCheck className="h-3 w-3 mr-1" />
                              Mark as Read
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 pb-3 border-b border-gray-200 bg-white p-3 rounded-lg shadow-sm">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary relative">
                          <span>SM</span>
                          <span className="absolute -top-1 -right-1 bg-primary w-3 h-3 rounded-full border-2 border-white"></span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">Sarah Miller (Manager)</p>
                            <p className="text-xs text-gray-500">Yesterday</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">Rent payment reminder</p>
                          <p className="text-sm mt-1">Just a friendly reminder that your rent payment is due on the 1st. Thank you!</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Reply</Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                              <CircleCheck className="h-3 w-3 mr-1" />
                              Mark as Read
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                          <span>RM</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">Robert Martinez (Maintenance)</p>
                            <p className="text-xs text-gray-500">Last week</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">Maintenance completed</p>
                          <p className="text-sm mt-1 text-gray-600">Your repair request has been completed. Please confirm everything is working properly.</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Confirm</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="reminders" className="space-y-4 mt-0">
                  <ScrollArea className="h-[240px] px-2">
                    <div className="space-y-3 pt-2 pr-4 pl-2">
                      <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start shadow-sm">
                        <div className="p-2 bg-primary/20 rounded-md mr-3">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium text-sm">Rent Payment Due</p>
                            <Badge variant="outline" className="ml-2 bg-primary/10 border-primary/30">
                              {nextPaymentDueDate ? new Date(nextPaymentDueDate).toLocaleDateString() : '05/01/2025'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Monthly rent payment for your current lease</p>
                          <div className="mt-2">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start shadow-sm">
                        <div className="p-2 bg-primary/10 rounded-md mr-3">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium text-sm">Annual Lease Renewal</p>
                            <Badge variant="outline" className="ml-2">
                              07/15/2025
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Your current lease will be up for renewal</p>
                          <div className="mt-2">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                              <Bell className="h-3 w-3 mr-1" />
                              Add Reminder
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg border border-gray-200 bg-white flex items-start shadow-sm">
                        <div className="p-2 bg-primary/10 rounded-md mr-3">
                          <ClipboardList className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium text-sm">Property Inspection</p>
                            <Badge variant="outline" className="ml-2">
                              05/12/2025
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Scheduled annual maintenance inspection</p>
                          <div className="mt-2">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              Add to Calendar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              <CardFooter className="flex flex-col xs:flex-row gap-2 pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/messages/new">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Message
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/messages">
                    <Bell className="h-4 w-4 mr-2" />
                    All Messages
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}