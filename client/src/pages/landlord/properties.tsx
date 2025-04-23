import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import AppLayout from "@/components/layout/app-layout";
import PropertyListings from "@/components/dashboard/property-listings";
import PropertyModal from "@/components/modals/property-modal";
import type { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LandlordProperties() {
  const { user } = useAuth();
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fetch landlord's properties
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });
  
  // Filter properties based on search term and status
  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.addressStreet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.addressCity.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <AppLayout>
      <div className="py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">My Properties</h1>
            <div className="flex space-x-3">
              <Button onClick={() => setShowPropertyModal(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
              <Button asChild variant="secondary">
                <Link href="/landlord/new-property">
                  <Plus className="h-4 w-4 mr-2" />
                  Standard Property
                </Link>
              </Button>
              <Button asChild>
                <Link href="/landlord/property-details">
                  <Plus className="h-4 w-4 mr-2" />
                  Detailed Property
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Filter Properties</CardTitle>
              <CardDescription>
                Search and filter your properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="not_available">Not Available</SelectItem>
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
          
          {/* Properties Listing */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {filteredProperties.length === 0 ? (
                <Card className="mb-6">
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <Building className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No properties found</h3>
                    <p className="text-sm text-gray-500 mb-4 text-center">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your filters to see more results."
                        : "Get started by adding your first property."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={() => setShowPropertyModal(true)} variant="outline">
                        Quick Add Property
                      </Button>
                      <Button asChild variant="secondary">
                        <Link href="/landlord/new-property">
                          Standard Property
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href="/landlord/property-details">
                          Detailed Property
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <PropertyListings 
                  properties={filteredProperties} 
                  onAddProperty={() => setShowPropertyModal(true)} 
                  showAddPropertyCard={false}
                />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Property Modal */}
      <PropertyModal
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        onSave={() => {
          setShowPropertyModal(false);
          // Should invalidate properties query after successful save
          // queryClient.invalidateQueries(["/api/properties"]);
        }}
      />
    </AppLayout>
  );
}

// Import for the Building icon used when there are no properties
import { Building } from "lucide-react";
