import React from "react";
import { Card, CardContent, CardFooter } from "./card";
import { Button } from "./button";
import { Bed, Bath, Home, MapPin, DollarSign, Calendar, ChevronRight, CalendarCheck } from "lucide-react";
import { PropertyMatchIndicator } from "./property-match-indicator";
import { motion } from "framer-motion";
import { Badge } from "./badge";
import { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  viewMode?: "grid" | "list";
  showMatchPercentage?: boolean;
  matchPercentage?: number;
  onScheduleViewing?: () => void;
  onApplyNow?: () => void;
  onClick?: () => void;
}

export function PropertyCard({
  property,
  viewMode = "grid",
  showMatchPercentage = false,
  matchPercentage = 0,
  onScheduleViewing,
  onApplyNow,
  onClick
}: PropertyCardProps) {
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: { 
      y: -5,
      boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  const imageVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Determine property availability status
  const isAvailable = property.status === "available" && !property.tenantId;

  // Get amenities list
  const amenities = [];
  if (property.hasParking) amenities.push("Parking");
  if (property.hasAirConditioning) amenities.push("AC");
  if (property.hasHeating) amenities.push("Heating");
  if (property.hasWasherDryer) amenities.push("W/D");
  if (property.hasDishwasher) amenities.push("Dishwasher");
  if (property.hasGarden) amenities.push("Garden");
  if (property.hasBalcony) amenities.push("Balcony");
  if (property.isSmokingAllowed) amenities.push("Smoking OK");
  if (property.petsAllowed) amenities.push("Pets OK");
  if (property.isFurnished) amenities.push("Furnished");
  
  // Format property type for display
  const formatPropertyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  if (viewMode === "list") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 h-48 md:h-auto bg-slate-200 relative overflow-hidden">
              <motion.img 
                variants={imageVariants}
                src={property.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {showMatchPercentage && (
                <div className="absolute top-3 right-3 z-10">
                  <PropertyMatchIndicator 
                    matchPercentage={matchPercentage} 
                    size="md"
                  />
                </div>
              )}
              {isAvailable && (
                <div className="absolute bottom-3 right-3">
                  <Badge variant="success">Available</Badge>
                </div>
              )}
            </div>
            <div className="flex-1 p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-lg">{property.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {property.addressStreet}, {property.addressCity}
                  </p>
                </div>
                <p className="font-bold text-lg">{formatCurrency(property.monthlyRent)}</p>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{property.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center text-sm">
                  <Bed className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Bath className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Home className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{property.squareFeet} sqft</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{formatPropertyType(property.propertyType)}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {amenities.slice(0, 4).map((amenity, index) => (
                  <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {amenity}
                  </span>
                ))}
                {amenities.length > 4 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{amenities.length - 4} more
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={onClick || (() => {})}>
                  View details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                {isAvailable && (
                  <>
                    {onScheduleViewing && (
                      <Button variant="outline" size="sm" onClick={onScheduleViewing}>
                        <CalendarCheck className="h-4 w-4 mr-1" />
                        Schedule Viewing
                      </Button>
                    )}
                    {onApplyNow && (
                      <Button size="sm" onClick={onApplyNow}>
                        Apply Now
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }
  
  // Default Grid view
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="h-full"
    >
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="h-44 bg-slate-200 relative overflow-hidden">
          <motion.img 
            variants={imageVariants}
            src={property.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          {showMatchPercentage && (
            <div className="absolute top-3 right-3 z-10">
              <PropertyMatchIndicator 
                matchPercentage={matchPercentage} 
                size="md"
              />
            </div>
          )}
          {isAvailable && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="success">Available</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-grow">
          <div className="mb-2">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-base">{property.title}</h3>
              <p className="font-bold">{formatCurrency(property.monthlyRent)}</p>
            </div>
            <p className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              {property.addressCity}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 my-3">
            <div className="flex items-center text-sm">
              <Bed className="h-4 w-4 mr-1 text-gray-500" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center text-sm">
              <Bath className="h-4 w-4 mr-1 text-gray-500" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center text-sm">
              <Home className="h-4 w-4 mr-1 text-gray-500" />
              <span>{property.squareFeet} sqft</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mb-3">
            {amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onClick || (() => {})}
          >
            View details
          </Button>
          {isAvailable && onApplyNow && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={onApplyNow}
            >
              Apply Now
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default PropertyCard;