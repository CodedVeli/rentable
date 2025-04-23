import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import { Viewing, Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Search, Filter, Calendar, Plus, Clock, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LandlordViewings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("scheduledDateTime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  
  // Form state for viewing scheduling
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [viewingDate, setViewingDate] = useState("");
  const [viewingTime, setViewingTime] = useState("");
  const [viewingNotes, setViewingNotes] = useState("");
  
  // Fetch landlord's viewings
  const { data: viewings = [], isLoading: viewingsLoading } = useQuery<Viewing[]>({
    queryKey: ["/api/viewings"],
    enabled: !!user,
  });
  
  // Fetch properties for viewing scheduling
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });
  
  // Filter viewings based on search term and status
  const filteredViewings = viewings.filter(viewing => {
    const matchesStatus = statusFilter === "all" || viewing.status === statusFilter;
    
    // In a real app, we would have property and tenant names
    // For now, we'll just use IDs for search
    const matchesSearch = 
      viewing.id.toString().includes(searchTerm) ||
      viewing.propertyId.toString().includes(searchTerm) ||
      (viewing.tenantId && viewing.tenantId.toString().includes(searchTerm)) ||
      (viewing.notes && viewing.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort viewings
  const sortedViewings = [...filteredViewings].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortField) {
      case "scheduledDateTime":
        aValue = new Date(a.scheduledDateTime).getTime();
        bValue = new Date(b.scheduledDateTime).getTime();
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = a.id;
        bValue = b.id;
    }
    
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const handleScheduleViewing = async () => {
    if (!selectedPropertyId) {
      toast({
        title: "Error",
        description: "Please select a property.",
        variant: "destructive",
      });
      return;
    }
    
    if (!viewingDate || !viewingTime) {
      toast({
        title: "Error",
        description: "Please provide both date and time for the viewing.",
        variant: "destructive",
      });
      return;
    }
    
    // Combine date and time
    const scheduledDateTime = new Date(`${viewingDate}T${viewingTime}`);
    
    try {
      // Schedule viewing
      await apiRequest("POST", "/api/viewings", {
        propertyId: selectedPropertyId,
        landlordId: user!.id,
        tenantId: selectedTenantId,
        scheduledDateTime: scheduledDateTime.toISOString(),
        status: "pending",
        notes: viewingNotes
      });
      
      // Close dialog and reset form
      setShowScheduleDialog(false);
      resetViewingForm();
      
      // Invalidate viewings query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/viewings"] });
      
      toast({
        title: "Success",
        description: "Viewing has been scheduled.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule viewing. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const resetViewingForm = () => {
    setSelectedPropertyId(null);
    setSelectedTenantId(null);
    setViewingDate("");
    setViewingTime("");
    setViewingNotes("");
  };
  
  const updateViewingStatus = async (viewingId: number, newStatus: string) => {
    try {
      await apiRequest("PATCH", `/api/viewings/${viewingId}`, {
        status: newStatus
      });
      
      // Invalidate viewings query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/viewings"] });
      
      toast({
        title: "Success",
        description: `Viewing status updated to ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update viewing status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const isLoading = viewingsLoading || propertiesLoading;
  
  // Function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "outline";
      case "cancelled":
        return "destructive";
      case "completed":
        return "secondary";
      default:
        return "secondary";
    }
  };
  
  // Helper function to format date and time
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })
    };
  };
  
  return (
    <AppLayout>
      <div className="py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Viewing Schedule</h1>
            <Button onClick={() => setShowScheduleDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Viewing
            </Button>
          </div>
          
          {/* Upcoming Viewings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary-600">
                  {viewings.filter(v => 
                    v.status === "confirmed" && 
                    new Date(v.scheduledDateTime) > new Date()
                  ).length}
                </p>
                <p className="text-sm text-gray-500">confirmed viewings</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-600">
                  {viewings.filter(v => v.status === "pending").length}
                </p>
                <p className="text-sm text-gray-500">awaiting confirmation</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Today</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  {viewings.filter(v => {
                    const viewingDate = new Date(v.scheduledDateTime);
                    const today = new Date();
                    return (
                      viewingDate.getDate() === today.getDate() &&
                      viewingDate.getMonth() === today.getMonth() &&
                      viewingDate.getFullYear() === today.getFullYear() &&
                      (v.status === "confirmed" || v.status === "pending")
                    );
                  }).length}
                </p>
                <p className="text-sm text-gray-500">scheduled for today</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Filter Viewings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search viewings..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Viewings Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Viewing Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {sortedViewings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No viewings found</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your filters to see more results."
                          : "Get started by scheduling your first property viewing."}
                      </p>
                      <Button onClick={() => setShowScheduleDialog(true)}>
                        Schedule Viewing
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <Button 
                              variant="ghost" 
                              className="p-0 hover:bg-transparent"
                              onClick={() => handleSort("scheduledDateTime")}
                            >
                              Date & Time
                              {sortField === "scheduledDateTime" && (
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Tenant</TableHead>
                          <TableHead>
                            <Button 
                              variant="ghost" 
                              className="p-0 hover:bg-transparent"
                              onClick={() => handleSort("status")}
                            >
                              Status
                              {sortField === "status" && (
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedViewings.map(viewing => {
                          const { date, time } = formatDateTime(viewing.scheduledDateTime);
                          const isPast = new Date(viewing.scheduledDateTime) < new Date();
                          
                          return (
                            <TableRow key={viewing.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                  <div>
                                    <div>{date}</div>
                                    <div className="text-sm text-gray-500">
                                      <Clock className="h-3 w-3 inline mr-1" />
                                      {time}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {properties.find(p => p.id === viewing.propertyId)?.title || 
                                 `Property ID: ${viewing.propertyId}`}
                              </TableCell>
                              <TableCell>
                                {viewing.tenantId ? `Tenant ID: ${viewing.tenantId}` : "Open viewing"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(viewing.status)}>
                                  {viewing.status.charAt(0).toUpperCase() + viewing.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs truncate">
                                  {viewing.notes || "No notes"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  {viewing.status === "pending" && !isPast && (
                                    <>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-green-600 border-green-600 hover:bg-green-50"
                                        onClick={() => updateViewingStatus(viewing.id, "confirmed")}
                                      >
                                        Confirm
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-red-600 border-red-600 hover:bg-red-50"
                                        onClick={() => updateViewingStatus(viewing.id, "cancelled")}
                                      >
                                        Cancel
                                      </Button>
                                    </>
                                  )}
                                  {viewing.status === "confirmed" && !isPast && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                      onClick={() => updateViewingStatus(viewing.id, "cancelled")}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                  {viewing.status === "confirmed" && isPast && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => updateViewingStatus(viewing.id, "completed")}
                                    >
                                      Mark Completed
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Schedule Viewing Dialog */}
      <Dialog 
        open={showScheduleDialog} 
        onOpenChange={setShowScheduleDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Property Viewing</DialogTitle>
            <DialogDescription>
              Schedule a date and time for a property viewing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="property" className="text-right">
                Property
              </Label>
              <Select 
                value={selectedPropertyId?.toString() || ""} 
                onValueChange={(value) => setSelectedPropertyId(parseInt(value))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.title} - {property.addressStreet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tenant" className="text-right">
                Tenant (Optional)
              </Label>
              <Select 
                value={selectedTenantId?.toString() || ""} 
                onValueChange={(value) => setSelectedTenantId(parseInt(value))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Open viewing or select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {/* This would be populated from an API in a real app */}
                  <SelectItem value="1">Sample Tenant 1</SelectItem>
                  <SelectItem value="2">Sample Tenant 2</SelectItem>
                  <SelectItem value="3">Sample Tenant 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="viewingDate" className="text-right">
                Date
              </Label>
              <Input 
                id="viewingDate" 
                type="date" 
                className="col-span-3"
                value={viewingDate}
                onChange={(e) => setViewingDate(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="viewingTime" className="text-right">
                Time
              </Label>
              <Input 
                id="viewingTime" 
                type="time" 
                className="col-span-3"
                value={viewingTime}
                onChange={(e) => setViewingTime(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="viewingNotes" className="text-right pt-2">
                Notes
              </Label>
              <Input 
                id="viewingNotes" 
                className="col-span-3"
                placeholder="Additional information or instructions..."
                value={viewingNotes}
                onChange={(e) => setViewingNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowScheduleDialog(false);
                resetViewingForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleScheduleViewing}>
              Schedule Viewing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
