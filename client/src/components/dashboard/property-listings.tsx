import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  MapPin, 
  ArrowRight, 
  Bed, 
  Bath, 
  SquareCode, 
  Plus,
  UserCheck,
  Clock,
  CalendarCheck,
  Calendar,
  Star,
  ParkingSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export interface PropertyListingsProps {
  properties: Property[];
  showAddPropertyCard?: boolean;
  onAddProperty?: () => void;
  isLoading?: boolean;
  tenantScores?: Record<number, number>;
}

export default function PropertyListings({ 
  properties, 
  showAddPropertyCard = true,
  onAddProperty,
  isLoading = false,
  tenantScores = {}
}: PropertyListingsProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount / 100);
  };
  
  const statusBadgeVariants = {
    available: "bg-green-50 text-green-700 border-green-200",
    rented: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200", 
    maintenance: "bg-red-50 text-red-700 border-red-200",
    not_available: "bg-gray-50 text-gray-700 border-gray-200"
  };
  
  const statusIcons = {
    available: <Clock className="h-4 w-4 mr-1 text-green-600" />,
    rented: <UserCheck className="h-4 w-4 mr-1 text-blue-600" />,
    pending: <Calendar className="h-4 w-4 mr-1 text-yellow-600" />,
    maintenance: <ParkingSquare className="h-4 w-4 mr-1 text-red-600" />,
    not_available: <CalendarCheck className="h-4 w-4 mr-1 text-gray-600" />
  };
  
  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader className="pb-2">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between pt-2 pb-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-32 mt-2" />
              </CardContent>
              <CardFooter className="flex justify-end py-3">
                <Skeleton className="h-9 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Properties</h2>
      </div>
      
      {properties.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto rounded-full bg-gray-100 p-4 w-16 h-16 flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Properties Found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {showAddPropertyCard ? 
                "You haven't added any properties yet. Add your first property to get started." : 
                "No properties match your current search criteria."}
            </p>
            {showAddPropertyCard && (
              <Button onClick={onAddProperty}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="relative">
                {property.photos && property.photos.length > 0 ? (
                  <div className="relative h-48 w-full">
                    <img 
                      src={property.photos[0]} 
                      alt={property.title} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                    <Home className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge 
                    variant="outline"
                    className={`capitalize font-medium ${
                      statusBadgeVariants[property.status as keyof typeof statusBadgeVariants] || statusBadgeVariants.not_available
                    }`}
                  >
                    {statusIcons[property.status as keyof typeof statusIcons]}
                    {property.status === "available" ? "Available" : 
                     property.status === "rented" ? "Rented" : 
                     property.status === "pending" ? "Pending" : 
                     property.status === "maintenance" ? "Under Maintenance" : 
                     "Not Available"}
                  </Badge>
                </div>
                
                {tenantScores[property.id] && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                      <Star className="h-3.5 w-3.5 mr-1 text-primary-500 fill-primary-200" />
                      {tenantScores[property.id]}% Match
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-1">
                      {property.title}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-500 mr-1 flex-shrink-0" />
                      <span className="text-sm text-gray-500 line-clamp-1">
                        {property.addressStreet}, {property.addressCity}, {property.addressProvince} {property.addressPostalCode}
                      </span>
                    </CardDescription>
                  </div>
                  <p className="text-lg font-bold text-primary-600">
                    {formatCurrency(property.monthlyRent)}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="pt-3 pb-3">
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <Bed className="h-4 w-4 mr-1" />
                    <span>{property.bedrooms} bd</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Bath className="h-4 w-4 mr-1" />
                    <span>{property.bathrooms} ba</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <SquareCode className="h-4 w-4 mr-1" />
                    <span>{property.areaSquareFeet} ft²</span>
                  </div>
                </div>
                
                {property.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {property.description}
                  </p>
                )}
              </CardContent>
              
              <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-between py-3">
                {property.amenities && property.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {property.amenities.slice(0, 2).map((amenity, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-white">
                        {amenity}
                      </Badge>
                    ))}
                    {property.amenities.length > 2 && (
                      <Badge variant="outline" className="text-xs bg-white">
                        +{property.amenities.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}
                
                <Button size="sm" asChild>
                  <Link href={`/properties/${property.id}`}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {showAddPropertyCard && (
            <Card 
              className="border-dashed border-2 border-gray-200 bg-gray-50 flex flex-col items-center justify-center py-10 cursor-pointer hover:bg-gray-100 transition-colors duration-200" 
              onClick={onAddProperty}
            >
              <div className="rounded-full bg-primary-100 p-3 mb-3">
                <Plus className="h-6 w-6 text-primary-600" />
              </div>
              <p className="text-gray-800 font-medium">Add New Property</p>
              <p className="text-sm text-gray-500 mt-1">List a new property for rent</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}