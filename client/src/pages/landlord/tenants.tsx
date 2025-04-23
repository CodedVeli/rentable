import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import { User, Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, Star, Filter } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function LandlordTenants() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch landlord's properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !!user,
  });
  
  // Get unique tenant IDs from properties
  const tenantIds = Array.from(new Set(
    properties
      .filter(property => property.tenantId !== null)
      .map(property => property.tenantId!)
  ));
  
  // Fetch tenant details (in a real app, we'd have a dedicated API endpoint)
  // For now, mocking the tenant data structure, but this would be populated from the API
  const { isLoading: tenantsLoading } = useQuery<User[]>({
    queryKey: ["/api/users/tenants"],
    enabled: false, // Disabled for now, as we don't have this endpoint
  });
  
  // This would be replaced by actual API data
  const tenants = properties
    .filter(property => property.tenantId !== null)
    .map(property => ({
      id: property.tenantId!,
      propertyId: property.id,
      propertyTitle: property.title,
      leaseEndDate: property.leaseEndDate,
      monthlyRent: property.monthlyRent,
      // These fields would come from the actual User data
      firstName: "Tenant",
      lastName: `${property.id}`,
      email: `tenant${property.id}@example.com`,
      phoneNumber: "(416) 555-1234",
      profileImage: null,
      verificationStatus: "verified" as const,
      creditScore: 750,
    }));
  
  // Filter tenants based on search term
  const filteredTenants = tenants.filter(tenant => {
    const fullName = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
           tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tenant.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const isLoading = propertiesLoading || tenantsLoading;
  
  return (
    <AppLayout>
      <div className="py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Tenants</h1>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search tenants..."
                  className="pl-8 w-60"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
          
          {/* Tenants Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Tenants</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {filteredTenants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No tenants found</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {searchTerm 
                          ? "Try adjusting your search to see more results."
                          : "Currently, you don't have any tenants for your properties."}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tenant</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Lease End</TableHead>
                          <TableHead>Monthly Rent</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTenants.map(tenant => (
                          <TableRow key={`${tenant.id}-${tenant.propertyId}`}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src={tenant.profileImage || undefined} />
                                  <AvatarFallback>
                                    {tenant.firstName.charAt(0)}{tenant.lastName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{`${tenant.firstName} ${tenant.lastName}`}</div>
                                  <div className="text-sm text-gray-500">{tenant.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{tenant.propertyTitle}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={tenant.verificationStatus === "verified" ? "success" : "warning"}>
                                {tenant.verificationStatus === "verified" ? "Verified" : "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {tenant.leaseEndDate 
                                ? new Date(tenant.leaseEndDate).toLocaleDateString('en-CA')
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              ${(tenant.monthlyRent / 100).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/messages/${tenant.id}`}>
                                    <Mail className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => window.open(`tel:${tenant.phoneNumber}`)}>
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/landlord/tenants/${tenant.id}`}>
                                    <Star className="h-4 w-4" />
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
    </AppLayout>
  );
}
