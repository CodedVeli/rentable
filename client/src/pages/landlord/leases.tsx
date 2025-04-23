import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import { Lease, Property, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, Plus, ArrowUpDown, FileText, Eye, Pencil } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function LandlordLeases() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("startDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showCreateLeaseDialog, setShowCreateLeaseDialog] = useState(false);
  
  // Form state for lease creation
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [leaseTerms, setLeaseTerms] = useState("");
  
  // Fetch landlord's leases
  const { data: leases = [], isLoading: leasesLoading } = useQuery<Lease[]>({
    queryKey: ["/api/leases"],
    enabled: !!user,
  });
  
  // Fetch properties for lease creation
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });
  
  // Filter leases based on search term and status
  const filteredLeases = leases.filter(lease => {
    const matchesStatus = statusFilter === "all" || lease.status === statusFilter;
    
    // In a real app, we would have property and tenant names
    // For now, we'll just use IDs for search
    const matchesSearch = 
      lease.id.toString().includes(searchTerm) ||
      lease.propertyId.toString().includes(searchTerm) ||
      lease.tenantId.toString().includes(searchTerm);
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort leases
  const sortedLeases = [...filteredLeases].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortField) {
      case "startDate":
        aValue = new Date(a.startDate).getTime();
        bValue = new Date(b.startDate).getTime();
        break;
      case "endDate":
        aValue = new Date(a.endDate).getTime();
        bValue = new Date(b.endDate).getTime();
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "monthlyRent":
        aValue = a.monthlyRent;
        bValue = b.monthlyRent;
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
  
  const handleCreateLease = async () => {
    if (!selectedPropertyId) {
      toast({
        title: "Error",
        description: "Please select a property.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedTenantId) {
      toast({
        title: "Error",
        description: "Please select a tenant.",
        variant: "destructive",
      });
      return;
    }
    
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please provide both start and end dates.",
        variant: "destructive",
      });
      return;
    }
    
    if (!monthlyRent || isNaN(parseFloat(monthlyRent))) {
      toast({
        title: "Error",
        description: "Please enter a valid monthly rent amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (!depositAmount || isNaN(parseFloat(depositAmount))) {
      toast({
        title: "Error",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create lease
      await apiRequest("POST", "/api/leases", {
        propertyId: selectedPropertyId,
        landlordId: user!.id,
        tenantId: selectedTenantId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        monthlyRent: Math.round(parseFloat(monthlyRent) * 100),
        depositAmount: Math.round(parseFloat(depositAmount) * 100),
        leaseTerms: leaseTerms,
        status: "draft"
      });
      
      // Close dialog and reset form
      setShowCreateLeaseDialog(false);
      resetLeaseForm();
      
      // Invalidate leases query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/leases"] });
      
      toast({
        title: "Success",
        description: "Lease has been created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create lease. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const resetLeaseForm = () => {
    setSelectedPropertyId(null);
    setSelectedTenantId(null);
    setStartDate("");
    setEndDate("");
    setMonthlyRent("");
    setDepositAmount("");
    setLeaseTerms("");
  };
  
  const isLoading = leasesLoading || propertiesLoading;
  
  // Function to format currency
  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };
  
  // Function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "outline";
      case "draft":
        return "secondary";
      case "terminated":
        return "destructive";
      case "expired":
        return "default";
      default:
        return "secondary";
    }
  };
  
  return (
    <AppLayout>
      <div className="py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Lease Agreements</h1>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setShowCreateLeaseDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Lease
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Filter Leases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search leases..."
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
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
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
          
          {/* Leases Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Leases</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {sortedLeases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No leases found</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {searchTerm || statusFilter !== "all"
                          ? "Try adjusting your filters to see more results."
                          : "Get started by creating your first lease agreement."}
                      </p>
                      <Button onClick={() => setShowCreateLeaseDialog(true)}>
                        Create Lease
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lease #</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Tenant</TableHead>
                          <TableHead>
                            <Button 
                              variant="ghost" 
                              className="p-0 hover:bg-transparent"
                              onClick={() => handleSort("startDate")}
                            >
                              Start Date
                              {sortField === "startDate" && (
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button 
                              variant="ghost" 
                              className="p-0 hover:bg-transparent"
                              onClick={() => handleSort("endDate")}
                            >
                              End Date
                              {sortField === "endDate" && (
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button 
                              variant="ghost" 
                              className="p-0 hover:bg-transparent"
                              onClick={() => handleSort("monthlyRent")}
                            >
                              Monthly Rent
                              {sortField === "monthlyRent" && (
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </TableHead>
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
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedLeases.map(lease => (
                          <TableRow key={lease.id}>
                            <TableCell className="font-medium">#{lease.id}</TableCell>
                            <TableCell>Property ID: {lease.propertyId}</TableCell>
                            <TableCell>Tenant ID: {lease.tenantId}</TableCell>
                            <TableCell>
                              {new Date(lease.startDate).toLocaleDateString('en-CA')}
                            </TableCell>
                            <TableCell>
                              {new Date(lease.endDate).toLocaleDateString('en-CA')}
                            </TableCell>
                            <TableCell>{formatCurrency(lease.monthlyRent)}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(lease.status)}>
                                {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/landlord/leases/${lease.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/landlord/leases/${lease.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Create Lease Dialog */}
      <Dialog 
        open={showCreateLeaseDialog} 
        onOpenChange={setShowCreateLeaseDialog}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create Lease Agreement</DialogTitle>
            <DialogDescription>
              Create a new lease agreement for your property and tenant.
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
                  {properties
                    .filter(property => property.status === "available" || property.status === "not_available")
                    .map(property => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.title} - {property.addressStreet}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tenant" className="text-right">
                Tenant
              </Label>
              <Select 
                value={selectedTenantId?.toString() || ""} 
                onValueChange={(value) => setSelectedTenantId(parseInt(value))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a tenant" />
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
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input 
                id="startDate" 
                type="date" 
                className="col-span-3"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input 
                id="endDate" 
                type="date" 
                className="col-span-3"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthlyRent" className="text-right">
                Monthly Rent (CAD)
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  $
                </span>
                <Input 
                  id="monthlyRent" 
                  placeholder="0.00" 
                  className="pl-7"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="depositAmount" className="text-right">
                Deposit Amount (CAD)
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  $
                </span>
                <Input 
                  id="depositAmount" 
                  placeholder="0.00" 
                  className="pl-7"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="leaseTerms" className="text-right pt-2">
                Lease Terms
              </Label>
              <Textarea 
                id="leaseTerms" 
                className="col-span-3 h-20"
                placeholder="Enter the terms of the lease..."
                value={leaseTerms}
                onChange={(e) => setLeaseTerms(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateLeaseDialog(false);
                resetLeaseForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateLease}>
              Create Lease
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
