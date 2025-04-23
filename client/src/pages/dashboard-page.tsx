import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  ArrowRight,
  BarChart4,
  Building,
  Calendar,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  MessageSquare,
  Search,
  Shield,
  User,
  Menu,
  Bell
} from "lucide-react";
import { PropertyCard } from "@/components/ui/property-card";
import { PropertyMatchIndicator } from "@/components/ui/property-match-indicator";
import { usePropertyMatches } from "@/hooks/use-property-matches";

export default function DashboardPage() {
  const { user } = useAuth();
  const userRole = user?.role || "tenant"; // Default to tenant if role not set
  
  // Determine which dashboard to show based on user role
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Plaid-inspired clean, minimal sidebar with category organization */}
      <div className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center">
            <Home className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold text-lg">Rentr</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2">
          {/* Main Navigation */}
          <div className="mb-6">
            <Link href="/dashboard">
              <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-50 text-primary">
                <Home className="mr-3 h-5 w-5" />
                Home
              </a>
            </Link>
          </div>
          
          {/* Quickstart - similar to Plaid */}
          <div className="mb-2">
            <div className="px-3 py-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quickstart</span>
            </div>
            <div className="space-y-1">
              {userRole === "landlord" ? (
                <Link href="/landlord/new-property">
                  <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
                    <Building className="mr-3 h-5 w-5" />
                    Add Property
                  </a>
                </Link>
              ) : (
                <Link href="/tenant/find-properties">
                  <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
                    <Building className="mr-3 h-5 w-5" />
                    Find Property
                  </a>
                </Link>
              )}
            </div>
          </div>
          
          {/* Core Features */}
          <div className="mb-2">
            <div className="px-3 py-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Core Features</span>
            </div>
            <div className="space-y-1">
              {userRole === "landlord" ? (
                <>
                  <Link href="/landlord/properties">
                    <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
                      <Building className="mr-3 h-5 w-5" />
                      Properties
                    </a>
                  </Link>
                  <Link href="/landlord/tenants">
                    <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
                      <User className="mr-3 h-5 w-5" />
                      Tenants
                    </a>
                  </Link>
                  <Link href="/landlord/leases">
                    <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
                      <FileText className="mr-3 h-5 w-5" />
                      Leases
                    </a>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/tenant/applications">
                    <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
                      <FileText className="mr-3 h-5 w-5" />
                      My Applications
                    </a>
                  </Link>
                  <Link href="/tenant/lease">
                    <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
                      <FileText className="mr-3 h-5 w-5" />
                      My Lease
                    </a>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Financial Tools - similar to Plaid's organization */}
          <div className="mb-2">
            <div className="px-3 py-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial Tools</span>
            </div>
            <div className="space-y-1">
              <Link href="/payments">
                <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
                  <CreditCard className="mr-3 h-5 w-5" />
                  Payments
                </a>
              </Link>
              
              {userRole === "tenant" && (
                <Link href="/tenant/credit-check">
                  <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
                    <Shield className="mr-3 h-5 w-5" />
                    Credit Check
                  </a>
                </Link>
              )}
              
              {userRole === "landlord" && (
                <Link href="/landlord/tenant-score">
                  <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
                    <BarChart4 className="mr-3 h-5 w-5" />
                    Tenant Score
                  </a>
                </Link>
              )}
            </div>
          </div>
          
          {/* Communication */}
          <div className="mb-2">
            <div className="px-3 py-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Communication</span>
            </div>
            <div className="space-y-1">
              <Link href="/messages">
                <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100">
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Messages
                </a>
              </Link>
            </div>
          </div>
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.username || 'User'}</p>
              <p className="text-xs text-slate-500 capitalize">{userRole}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Navigation - Plaid-inspired minimalist header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center justify-between py-2.5 px-4">
            {/* Mobile menu button and logo */}
            <div className="flex items-center md:hidden">
              <div className="h-5 w-5 text-slate-600 mr-3">≡</div>
              <Home className="h-5 w-5 text-primary mr-2" />
              <span className="font-semibold">Rentr</span>
            </div>
            
            {/* Search bar - like Plaid's clean search */}
            <div className="relative w-full max-w-sm mx-4 hidden md:block">
              <div className="flex items-center relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search or ask a question" 
                  className="w-full pl-10 pr-4 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Right-side buttons - Inspired by Plaid's top-right buttons */}
            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              <button className="p-1.5 rounded-full hover:bg-slate-100 relative text-slate-600">
                <div className="flex items-center justify-center h-5 w-5">
                  <span className="text-lg">🔔</span>
                </div>
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Separated buttons with clean spacing */}
              <div className="hidden md:flex items-center ml-2">
                <div className="border-r border-slate-200 h-8 mx-2"></div>
                <span className="text-sm text-slate-600 mr-2">Rentr.com</span>
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="mr-2">
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    Account
                  </Button>
                </Link>
                <Link href="/checkout">
                  <Button size="sm">
                    <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                    Upgrade
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.username || 'User'}</h1>
            <p className="text-slate-500">Here's what's happening with your {userRole === "landlord" ? "properties" : "rental applications"}.</p>
          </div>
          
          {userRole === "landlord" ? (
            <LandlordDashboard />
          ) : (
            <TenantDashboard />
          )}
        </main>
      </div>
    </div>
  );
}

function LandlordDashboard() {
  return (
    <>
      {/* Quick Stats - Similar to Plaid's clean, data-focused cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-slate-500 mt-1">2 occupied, 2 vacant</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Leases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-slate-500 mt-1">1 renewal due in 45 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-slate-500 mt-1">2 new this week</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Different Sections */}
      <Tabs defaultValue="properties" className="mb-8">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="leases">Leases</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>123 Main St, Toronto</CardTitle>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Occupied</span>
                </div>
                <CardDescription>3 bedroom townhouse</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Current Rent</span>
                  <span className="font-medium">$2,400/mo</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tenant</span>
                  <span className="font-medium">John Doe</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>45 Park Ave, Toronto</CardTitle>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Vacant</span>
                </div>
                <CardDescription>2 bedroom condo</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Listed Rent</span>
                  <span className="font-medium">$1,950/mo</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="font-medium">3 applications pending</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  View Applications
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                Review and manage tenant applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Sarah Johnson</p>
                      <p className="text-sm text-slate-500">For: 45 Park Ave, Toronto</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Michael Chang</p>
                      <p className="text-sm text-slate-500">For: 45 Park Ave, Toronto</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>
                Track and manage rent payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">123 Main St</p>
                    <p className="text-sm text-slate-500">May 1, 2023</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$2,400.00</p>
                    <p className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full inline-block">Paid</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">456 Queen St</p>
                    <p className="text-sm text-slate-500">May 1, 2023</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$1,800.00</p>
                    <p className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full inline-block">Paid</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leases" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Leases</CardTitle>
              <CardDescription>
                Manage your current lease agreements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">123 Main St - John Doe</p>
                    <p className="text-sm text-slate-500">Expires: April 30, 2024</p>
                  </div>
                  <Button variant="outline" size="sm">View Lease</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">456 Queen St - Jane Smith</p>
                    <p className="text-sm text-slate-500">Expires: June 30, 2023</p>
                  </div>
                  <Button variant="outline" size="sm">Renew Lease</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Activity Feed */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Rent payment received</p>
                    <p className="text-sm text-slate-500">123 Main St - $2,400.00</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-slate-500">Today</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">New application received</p>
                    <p className="text-sm text-slate-500">45 Park Ave - Sarah Johnson</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-slate-500">Yesterday</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">New message</p>
                    <p className="text-sm text-slate-500">From: John Doe (123 Main St)</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-slate-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function PropertyMatchSection() {
  const { propertyMatches, isLoading, error } = usePropertyMatches();
  
  // Example properties to use when API returns empty results
  const exampleProperties = [
    {
      id: 1,
      title: "87 King St W, Suite 502",
      description: "1 bedroom, 1 bathroom",
      imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      price: "$1,850/mo",
      availableDate: "June 1",
      matchPercentage: 92,
      amenities: ["In-unit laundry", "Parking", "Dishwasher"],
      isAvailable: true,
    },
    {
      id: 2,
      title: "154 Queen St E",
      description: "2 bedroom, 2 bathroom",
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      price: "$2,100/mo",
      availableDate: "July 1",
      matchPercentage: 85,
      amenities: ["Dishwasher", "Gym", "Rooftop patio"],
      isAvailable: true,
    },
    {
      id: 3,
      title: "42 Bayview Ave",
      description: "3 bedroom, 2 bathroom",
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      price: "$2,750/mo",
      availableDate: "August 1",
      matchPercentage: 78,
      amenities: ["Backyard", "Garage", "Fireplace"],
      isAvailable: true,
    }
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6 text-center">
        <CardContent>
          <p className="text-slate-500 mb-4">We couldn't load your property matches at this time.</p>
          <p className="text-sm text-slate-400">Here are some properties you might be interested in:</p>
        </CardContent>
      </Card>
    );
  }
  
  // Use example properties when API returns empty results
  const displayProperties = propertyMatches.length > 0 
    ? propertyMatches.slice(0, 3).map(match => ({
        id: match.propertyId,
        title: `Property ${match.propertyId}`,
        description: "Modern apartment with great amenities",
        imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
        price: "$1,850/mo",
        availableDate: "June 1",
        matchPercentage: match.matchPercentage,
        amenities: ["In-unit laundry", "Parking", "Dishwasher"],
        isAvailable: true,
      }))
    : exampleProperties;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayProperties.map((property) => (
        <PropertyCard
          key={property.id}
          id={property.id}
          title={property.title}
          description={property.description}
          imageUrl={property.imageUrl}
          price={property.price}
          availableDate={property.availableDate}
          matchPercentage={property.matchPercentage}
          amenities={property.amenities}
          isAvailable={property.isAvailable}
          onClick={() => console.log(`Viewing property ${property.id}`)}
        />
      ))}
    </div>
  );
}

function TenantDashboard() {
  return (
    <>
      {/* Quick Stats - Plaid-inspired data-focused cards with clean headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="overflow-hidden">
          <div className="bg-primary h-1 w-full"></div>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <CreditCard className="h-4 w-4 text-primary mr-2" />
              Current Rent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,450.00</div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-slate-500">Due on the 1st</p>
              <Link href="/payments">
                <a className="text-xs text-primary font-medium flex items-center">
                  Pay now
                  <ChevronRight className="h-3 w-3 ml-1" />
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="bg-blue-500 h-1 w-full"></div>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <FileText className="h-4 w-4 text-blue-500 mr-2" />
              Lease Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-lg font-semibold">Active</div>
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Current</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-slate-500">Expires May 31, 2024</p>
              <Link href="/tenant/lease">
                <a className="text-xs text-primary font-medium flex items-center">
                  View lease
                  <ChevronRight className="h-3 w-3 ml-1" />
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="bg-green-500 h-1 w-full"></div>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
              <BarChart4 className="h-4 w-4 text-green-500 mr-2" />
              Tenant Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xl font-bold mr-3">
                84
              </div>
              <div>
                <div className="text-sm font-semibold text-green-600">Good standing</div>
                <p className="text-xs text-slate-500">Last updated: May 1, 2023</p>
              </div>
            </div>
            <div className="mt-2 text-right">
              <Link href="/tenant/score">
                <a className="text-xs text-primary font-medium flex items-center justify-end">
                  View details
                  <ChevronRight className="h-3 w-3 ml-1" />
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Different Sections */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="credit">Credit</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Residence</CardTitle>
                <CardDescription>
                  789 King St, Toronto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Landlord</span>
                    <span>Jane Smith</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Move-in Date</span>
                    <span>June 1, 2022</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lease Term</span>
                    <span>1 year</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View Lease Details
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>
                  Your payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Payment</span>
                    <span>May 1, 2023 - $1,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Next Payment</span>
                    <span>June 1, 2023 - $1,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Method</span>
                    <span>Credit Card (**** 1234)</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm" className="w-full">
                  Make a Payment
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View your recent payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">May 2023 Rent</p>
                    <p className="text-sm text-slate-500">Paid on May 1, 2023</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$1,450.00</p>
                    <p className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full inline-block">Paid</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">April 2023 Rent</p>
                    <p className="text-sm text-slate-500">Paid on April 1, 2023</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$1,450.00</p>
                    <p className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full inline-block">Paid</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">March 2023 Rent</p>
                    <p className="text-sm text-slate-500">Paid on March 1, 2023</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$1,450.00</p>
                    <p className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full inline-block">Paid</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Applications</CardTitle>
              <CardDescription>
                Track the status of your rental applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">55 Queen St, Toronto</p>
                    <p className="text-sm text-slate-500">Applied on April 15, 2023</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full inline-block">Under Review</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">123 Elm St, Toronto</p>
                    <p className="text-sm text-slate-500">Applied on April 10, 2023</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full inline-block">Declined</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" className="w-full">
                Find New Properties
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="credit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Credit Score & Tenant Rating</CardTitle>
              <CardDescription>
                Your current financial and rental standing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Tenant Score</h3>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xl font-bold">
                      84
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-green-700">Good Standing</p>
                      <p className="text-sm text-slate-500">Updated May 1, 2023</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Rental History</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">On-time Payments</span>
                      <span className="font-medium">12/12 (100%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Average Lease Length</span>
                      <span className="font-medium">1.5 years</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs mr-2 mt-0.5">
                      ✓
                    </div>
                    <span className="text-sm">Maintain your perfect payment history to improve your score.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs mr-2 mt-0.5">
                      ✓
                    </div>
                    <span className="text-sm">Consider setting up automatic payments to ensure on-time rent payments.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Request Full Credit Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Properties Section */}
      <div className="mb-12 mt-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Recommended Properties</h2>
        
        <PropertyMatchSection />
        
        <div className="mt-4 text-right">
          <Link href="/tenant/find-properties">
            <a className="text-sm text-primary font-medium inline-flex items-center">
              View all properties
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </Link>
        </div>
      </div>
        
      {/* Activity Feed */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Rent payment processed</p>
                    <p className="text-sm text-slate-500">May 2023 - $1,450.00</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-slate-500">May 1, 2023</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">New message from landlord</p>
                    <p className="text-sm text-slate-500">Regarding: Annual inspection</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-slate-500">April 28, 2023</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                    <BarChart4 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Tenant score updated</p>
                    <p className="text-sm text-slate-500">Score increased to 84</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-slate-500">April 15, 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}