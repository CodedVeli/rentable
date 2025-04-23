import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import { useToast } from "@/hooks/use-toast";
import { demoProperties } from "@/utils/demo-data";
import { 
  Calendar,
  Clock,
  MapPin,
  Home,
  User,
  Search,
  CheckCircle,
  XCircle,
  CalendarDays,
  AlertCircle,
  ChevronRight,
  Plus,
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";

// Define the viewing type for type safety
interface Viewing {
  id: number;
  propertyId: number;
  tenantId: number;
  landlordId: number;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  scheduledDate: string;
  notes?: string;
  feedback?: string;
  property?: any; // Will be populated with property details
  landlord?: any; // Will be populated with landlord details
  createdAt: string;
  updatedAt: string;
}

export default function TenantViewings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [cancelViewingId, setCancelViewingId] = useState<number | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedViewingId, setSelectedViewingId] = useState<number | null>(null);
  const [viewingFeedback, setViewingFeedback] = useState("");
  
  // Demo data to use when the API isn't available
  const currentDate = new Date();
  const demoViewings: Viewing[] = [
    {
      id: 1001,
      propertyId: 1,
      tenantId: user?.id || 1,
      landlordId: 2,
      status: "scheduled",
      scheduledDate: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      notes: "Please arrive 10 minutes early. Parking available on premises.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      property: demoProperties.find(p => p.id === 1) || demoProperties[0],
      landlord: {
        id: 2,
        firstName: "Jane",
        lastName: "Landlord",
        email: "jane@example.com"
      }
    },
    {
      id: 1002,
      propertyId: 2,
      tenantId: user?.id || 1,
      landlordId: 2,
      status: "pending",
      scheduledDate: new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      notes: "Virtual viewing via Zoom. Link will be sent 30 minutes before.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      property: demoProperties.find(p => p.id === 2) || demoProperties[1],
      landlord: {
        id: 2,
        firstName: "Jane",
        lastName: "Landlord",
        email: "jane@example.com"
      }
    },
    {
      id: 1003,
      propertyId: 3,
      tenantId: user?.id || 1,
      landlordId: 3,
      status: "completed",
      scheduledDate: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      notes: "Tour with property manager",
      feedback: "Great location, but kitchen is smaller than expected.",
      createdAt: new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      property: demoProperties.find(p => p.id === 3) || demoProperties[2],
      landlord: {
        id: 3,
        firstName: "Michael",
        lastName: "Owner",
        email: "michael@example.com"
      }
    },
    {
      id: 1004,
      propertyId: 4,
      tenantId: user?.id || 1,
      landlordId: 4,
      status: "cancelled",
      scheduledDate: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      notes: "Cancelled due to illness",
      createdAt: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      property: demoProperties.find(p => p.id === 4) || demoProperties[3],
      landlord: {
        id: 4,
        firstName: "Sarah",
        lastName: "Property",
        email: "sarah@example.com"
      }
    }
  ];
  
  // Fetch viewings from API
  const { data: viewings = demoViewings, isLoading } = useQuery({
    queryKey: ['/api/viewings'],
    enabled: !!user,
    queryFn: async () => {
      try {
        const response = await fetch(`/api/viewings?tenantId=${user?.id}`);
        if (!response.ok) throw new Error('Failed to fetch viewings');
        const viewingsData = await response.json();
        
        // Fetch property details for each viewing
        const viewingsWithProperties = await Promise.all(viewingsData.map(async (viewing: Viewing) => {
          try {
            const propResponse = await fetch(`/api/property/${viewing.propertyId}`);
            if (propResponse.ok) {
              const property = await propResponse.json();
              return { ...viewing, property };
            }
          } catch (error) {
            console.error('Error fetching property details:', error);
          }
          return viewing;
        }));
        
        return viewingsWithProperties;
      } catch (error) {
        console.error('Falling back to demo data:', error);
        return demoViewings;
      }
    }
  });
  
  // Filter viewings based on active tab and search term
  const filteredViewings = viewings.filter(viewing => {
    // First filter by tab
    if (
      (activeTab === "upcoming" && !["pending", "scheduled"].includes(viewing.status)) ||
      (activeTab === "past" && !["completed", "cancelled"].includes(viewing.status))
    ) {
      return false;
    }
    
    // Then filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        viewing.property?.title?.toLowerCase().includes(searchLower) ||
        viewing.property?.addressCity?.toLowerCase().includes(searchLower) ||
        viewing.property?.addressStreet?.toLowerCase().includes(searchLower) ||
        viewing.landlord?.firstName?.toLowerCase().includes(searchLower) ||
        viewing.landlord?.lastName?.toLowerCase().includes(searchLower) ||
        viewing.notes?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Sort viewings by date (upcoming first for "upcoming" tab, most recent first for "past" tab)
  const sortedViewings = [...filteredViewings].sort((a, b) => {
    const dateA = new Date(a.scheduledDate).getTime();
    const dateB = new Date(b.scheduledDate).getTime();
    return activeTab === "upcoming" ? dateA - dateB : dateB - dateA;
  });
  
  // Handle cancelling a viewing
  const handleCancelViewing = async () => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/viewings/${cancelViewingId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: 'cancelled' })
      // });
      
      toast({
        title: "Viewing Cancelled",
        description: "The viewing has been cancelled successfully.",
      });
      
      // Update local state to reflect the cancelled viewing
      const updatedViewings = viewings.map(viewing => 
        viewing.id === cancelViewingId 
          ? { ...viewing, status: "cancelled" } 
          : viewing
      );
      
      // Reset state
      setCancelDialogOpen(false);
      setCancelViewingId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel viewing. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle submitting feedback for a viewing
  const handleSubmitFeedback = async () => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/viewings/${selectedViewingId}/feedback`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ feedback: viewingFeedback })
      // });
      
      toast({
        title: "Feedback Submitted",
        description: "Your feedback has been submitted successfully.",
      });
      
      // Update local state to reflect the feedback
      const updatedViewings = viewings.map(viewing => 
        viewing.id === selectedViewingId 
          ? { ...viewing, feedback: viewingFeedback } 
          : viewing
      );
      
      // Reset state
      setFeedbackDialogOpen(false);
      setSelectedViewingId(null);
      setViewingFeedback("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Helper function to format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    const timeFormatted = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return { date: dateFormatted, time: timeFormatted };
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "scheduled":
        return <Badge variant="success">Confirmed</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
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
            <h1 className="text-2xl font-bold">Property Viewings</h1>
            <p className="text-gray-600 mt-1">Manage your property viewing appointments</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/tenant/properties">
                <Plus className="h-4 w-4 mr-2" />
                Schedule New Viewing
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Tabs and Search */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="upcoming">
                <CalendarDays className="h-4 w-4 mr-2" />
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past">
                <Clock className="h-4 w-4 mr-2" />
                Past
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search viewings by property, landlord, or notes..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Upcoming Appointments Alert */}
        {activeTab === "upcoming" && sortedViewings.length > 0 && sortedViewings[0].status === "scheduled" && (
          <Alert className="mb-6">
            <Calendar className="h-4 w-4" />
            <AlertTitle>Upcoming Viewing</AlertTitle>
            <AlertDescription>
              You have a viewing scheduled for{" "}
              <span className="font-medium">
                {formatDateTime(sortedViewings[0].scheduledDate).date} at {formatDateTime(sortedViewings[0].scheduledDate).time}
              </span>{" "}
              at{" "}
              <span className="font-medium">
                {sortedViewings[0].property?.title}
              </span>.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Viewings Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "upcoming" ? "Upcoming Viewings" : "Past Viewings"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-md p-4 animate-pulse space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : sortedViewings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedViewings.map(viewing => (
                      <TableRow key={viewing.id}>
                        <TableCell>
                          <div className="font-medium flex items-center">
                            {viewing.property?.imageUrl ? (
                              <img 
                                src={viewing.property.imageUrl} 
                                alt={viewing.property?.title || "Property"} 
                                className="w-10 h-10 object-cover rounded-md mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                                <Home className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">
                                {viewing.property?.title || "Unnamed Property"}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {viewing.property?.addressCity || "Unknown Location"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatDateTime(viewing.scheduledDate).date}</span>
                            <span className="text-xs text-gray-500">{formatDateTime(viewing.scheduledDate).time}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(viewing.status)}
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="max-w-[200px] truncate">
                                  {viewing.notes || "No notes"}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-[300px] whitespace-normal">
                                  {viewing.notes || "No notes"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {viewing.status === "scheduled" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setCancelViewingId(viewing.id);
                                  setCancelDialogOpen(true);
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                            {viewing.status === "completed" && !viewing.feedback && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedViewingId(viewing.id);
                                  setFeedbackDialogOpen(true);
                                }}
                              >
                                Add Feedback
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link href={`/tenant/properties/${viewing.propertyId}`}>
                                View Property
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No viewings found</h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === "upcoming" 
                    ? "You don't have any upcoming property viewings scheduled." 
                    : "You haven't completed any property viewings yet."}
                </p>
                {activeTab === "upcoming" && (
                  <Button variant="outline" asChild>
                    <Link href="/tenant/properties">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule a Viewing
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Cancel Viewing Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cancel Viewing</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this viewing appointment? The landlord will be notified.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                Keep Appointment
              </Button>
              <Button variant="destructive" onClick={handleCancelViewing}>
                Yes, Cancel Viewing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Feedback Dialog */}
        <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Viewing Feedback</DialogTitle>
              <DialogDescription>
                How was your viewing experience? Your feedback helps landlords improve their properties.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="feedback" className="text-right">
                  Feedback
                </Label>
                <textarea
                  id="feedback"
                  className="col-span-3 flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="What did you like or dislike about the property? Was it as described?"
                  value={viewingFeedback}
                  onChange={(e) => setViewingFeedback(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleSubmitFeedback} disabled={!viewingFeedback.trim()}>
                Submit Feedback
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}