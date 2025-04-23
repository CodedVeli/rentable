import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import StatsOverview from "@/components/dashboard/stats-overview";
import Notifications from "@/components/dashboard/notifications";
import RecentActivity from "@/components/dashboard/recent-activity";
import PropertyListings from "@/components/dashboard/property-listings";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { demoProperties, demoPayments, demoLeases, demoRecentActivities } from "@/utils/demo-data";
import { 
  PlusCircle, 
  Calendar, 
  ClipboardList, 
  Users, 
  FileText, 
  Home, 
  DollarSign,
  Clock,
  BellRing 
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function LandlordDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch real properties instead of using demo data
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch real payments instead of using demo data
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/payments'],
    staleTime: 5 * 60 * 1000,
  });
  
  // Fetch real leases instead of using demo data
  const { data: leasesData, isLoading: leasesLoading } = useQuery({
    queryKey: ['/api/leases'],
    staleTime: 5 * 60 * 1000,
  });
  
  // Fetch real viewings instead of using demo data
  const { data: viewingsData, isLoading: viewingsLoading } = useQuery({
    queryKey: ['/api/viewings'],
    staleTime: 5 * 60 * 1000,
  });

  // Use real data if available, fall back to demo data if needed
  const myProperties = propertiesData || demoProperties.filter(p => p.landlordId === user?.id);
  const myPayments = paymentsData || demoPayments.filter(p => p.landlordId === user?.id);
  const myLeases = leasesData || demoLeases.filter(l => l.landlordId === user?.id);
  
  // Handle add property button click
  const handleAddProperty = () => {
    setLocation("/landlord/properties/new");
  };

  // Get all pending applications for my properties
  // In a real app, this would come from a query
  const pendingApplications = demoProperties
    .filter(p => p.landlordId === user?.id)
    .flatMap(p => {
      return { 
        id: p.id,
        title: p.title,
        applicationsCount: Math.floor(Math.random() * 3) // Demo data
      };
    })
    .filter(p => p.applicationsCount > 0);
    
  // Calculate upcoming viewings
  const upcomingViewings = (viewingsData || [])
    .filter((v: any) => v.status === "scheduled")
    .slice(0, 3);
    
  // Calculate expiring leases
  const currentDate = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(currentDate.getDate() + 30);
  
  const expiringLeases = (myLeases || [])
    .filter((lease: any) => {
      if (!lease.endDate) return false;
      const endDate = new Date(lease.endDate);
      return endDate > currentDate && endDate < thirtyDaysFromNow;
    })
    .slice(0, 3);
    
  // Calculate pending payments
  const pendingPayments = (myPayments || [])
    .filter((payment: any) => payment.status === "pending")
    .slice(0, 3);

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Landlord Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your properties, tenants, and lease agreements</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/landlord/viewings">
                <Calendar className="h-4 w-4 mr-2" />
                Viewings
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/landlord/applications">
                <ClipboardList className="h-4 w-4 mr-2" />
                Applications
              </Link>
            </Button>
            <Button asChild>
              <Link href="/landlord/properties/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Property
              </Link>
            </Button>
          </div>
        </div>
        
        <StatsOverview
          properties={myProperties}
          payments={myPayments}
          leases={myLeases}
          pendingApplications={pendingApplications}
          userRole="landlord"
        />
        
        <Tabs defaultValue="properties" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="properties">
              <Home className="h-4 w-4 mr-2" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="applications">
              <ClipboardList className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="tenants">
              <Users className="h-4 w-4 mr-2" />
              Tenants
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Clock className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="space-y-4">
            <PropertyListings
              properties={myProperties}
              onAddProperty={handleAddProperty}
              isLoading={propertiesLoading}
            />
          </TabsContent>
          
          <TabsContent value="applications" className="space-y-4">
            {pendingApplications.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Applications</CardTitle>
                  <CardDescription>Review tenant applications for your properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingApplications.map(property => (
                      <div key={property.id} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center">
                          <div className="rounded-md bg-primary-50 p-2 mr-3">
                            <ClipboardList className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{property.title}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Badge variant="outline" className="mr-2">
                                {property.applicationsCount} application{property.applicationsCount > 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/landlord/applications?property=${property.id}`}>
                            Review
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/landlord/applications">
                      View All Applications
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Pending Applications</CardTitle>
                  <CardDescription>You don't have any pending applications at the moment</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-6">
                  <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No applications have been submitted for your properties yet.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/landlord/properties">
                      View Your Properties
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="tenants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Tenants</CardTitle>
                <CardDescription>Manage your current tenants and leases</CardDescription>
              </CardHeader>
              <CardContent>
                {expiringLeases.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-gray-500 mb-2">Leases Expiring Soon</h3>
                    {expiringLeases.map((lease: any, index: number) => (
                      <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center">
                          <div className="rounded-md bg-yellow-50 p-2 mr-3">
                            <FileText className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium">{lease.propertyName || 'Property Lease'}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <span>Expires: {new Date(lease.endDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/landlord/leases/${lease.id}`}>
                            Manage
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No leases expiring in the next 30 days.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/landlord/tenants">
                    View All Tenants
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Viewings</CardTitle>
                  <CardDescription>Scheduled property viewings</CardDescription>
                </CardHeader>
                <CardContent>
                  {viewingsLoading ? (
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
                  ) : upcomingViewings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingViewings.map((viewing: any, index: number) => (
                        <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                          <div className="flex items-center">
                            <div className="rounded-md bg-blue-50 p-2 mr-3">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{viewing.propertyName || 'Property Viewing'}</p>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <span>{new Date(viewing.scheduledDate).toLocaleDateString()} at {new Date(viewing.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/landlord/viewings`}>
                              Details
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No upcoming viewings scheduled.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/landlord/viewings">
                      Manage Viewings
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Activity</CardTitle>
                  <CardDescription>Recent and pending payments</CardDescription>
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
                  ) : pendingPayments.length > 0 ? (
                    <div className="space-y-4">
                      {pendingPayments.map((payment: any, index: number) => (
                        <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                          <div className="flex items-center">
                            <div className="rounded-md bg-green-50 p-2 mr-3">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{payment.propertyName || 'Rental Payment'}</p>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Badge variant="outline" className="mr-2">
                                  Pending
                                </Badge>
                                <span>
                                  ${(payment.amount / 100).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/landlord/payments`}>
                              Details
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No pending payments to process.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/landlord/payments">
                      View All Payments
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <RecentActivity activities={demoRecentActivities} />
          </TabsContent>
        </Tabs>
        
        <div className="mb-8">
          <Notifications />
        </div>
      </div>
    </AppLayout>
  );
}