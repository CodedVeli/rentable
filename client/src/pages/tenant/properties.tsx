import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import { useToast } from "@/hooks/use-toast";
import { demoProperties } from "@/utils/demo-data";
import { filterCities } from "@/utils/cities";
import { 
  Home, 
  Search, 
  Filter, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  ArrowUpDown, 
  Plus,
  Calendar,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useLocation } from "wouter";
import { PropertyCard } from "@/components/ui/property-card";
import type { Property } from "@shared/schema";

export default function TenantProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [bedroomsFilter, setBedroomsFilter] = useState<string>("any");
  const [propertyType, setPropertyType] = useState<string>("any");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<string>("available");
  const [showListOnly, setShowListOnly] = useState(false);
  
  // Create a ref for the suggestions dropdown to handle click outside
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Modal state
  const [viewingDialogOpen, setViewingDialogOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [viewingDate, setViewingDate] = useState("");
  const [viewingNotes, setViewingNotes] = useState("");
  
  // Map state
  const [hoveredProperty, setHoveredProperty] = useState<number | null>(null);
  
  // Fetch properties
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    enabled: !!user,
    // If the API fails, fall back to demo data
    queryFn: async () => {
      try {
        const response = await fetch('/api/properties');
        if (!response.ok) throw new Error('Failed to fetch properties');
        return await response.json();
      } catch (error) {
        console.error('Falling back to demo data:', error);
        return [...demoProperties]; // Return a copy to avoid mutations
      }
    }
  });
  
  // Filter properties based on active tab and filters
  const filteredProperties = properties.filter(property => {
    // First filter by tab
    if (activeTab === "available" && (property.tenantId || property.status !== "available")) {
      return false;
    }
    
    if (activeTab === "my-properties" && property.tenantId !== user?.id) {
      return false;
    }
    
    if (activeTab === "shortlisted") {
      // Implement shortlisting feature later
      return false;
    }
    
    // Then filter by search term
    if (
      searchTerm && 
      !property.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !property.addressCity.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !property.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    // Filter by price
    if (property.monthlyRent < priceRange[0] || property.monthlyRent > priceRange[1]) {
      return false;
    }
    
    // Filter by bedrooms
    if (bedroomsFilter !== "any") {
      const bedroomCount = parseInt(bedroomsFilter, 10);
      if (bedroomsFilter === "4+" && property.bedrooms < 4) {
        return false;
      } else if (bedroomsFilter !== "4+" && property.bedrooms !== bedroomCount) {
        return false;
      }
    }
    
    // Filter by property type
    if (propertyType !== "any" && property.propertyType !== propertyType) {
      return false;
    }
    
    return true;
  });
  
  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "price-low":
        return a.monthlyRent - b.monthlyRent;
      case "price-high":
        return b.monthlyRent - a.monthlyRent;
      case "size-small":
        return a.squareFeet - b.squareFeet;
      case "size-large":
        return b.squareFeet - a.squareFeet;
      default:
        return 0;
    }
  });
  
  // Handle city suggestions
  useEffect(() => {
    if (searchTerm.length > 1) {
      const suggestions = filterCities(searchTerm);
      setCitySuggestions(suggestions);
      setShowCitySuggestions(suggestions.length > 0);
    } else {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    }
  }, [searchTerm]);

  // Handle click outside of suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Handle suggestion selection
  const handleSelectCity = (city: string) => {
    setSearchTerm(city);
    setShowCitySuggestions(false);
  };
  
  // Handle scheduling a viewing
  const handleScheduleViewing = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setViewingDialogOpen(true);
  };
  
  // Submit viewing request
  const submitViewingRequest = async () => {
    try {
      // In a real app, this would be an API call
      // await fetch('/api/viewings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     propertyId: selectedPropertyId,
      //     tenantId: user?.id,
      //     scheduledDate: viewingDate,
      //     notes: viewingNotes,
      //     status: 'pending'
      //   })
      // });
      
      toast({
        title: "Viewing Request Submitted",
        description: "We've sent your viewing request to the landlord.",
      });
      
      setViewingDialogOpen(false);
      setSelectedPropertyId(null);
      setViewingDate("");
      setViewingNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit viewing request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Submit application for a property
  const handleApplyForProperty = (propertyId: number) => {
    navigate(`/tenant/applications/new?propertyId=${propertyId}`);
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
  
  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Top Navigation and Filter Bar */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-2xl font-bold hidden sm:block">Properties</h1>
          
          <div className="flex items-center gap-3 flex-1 sm:flex-initial sm:max-w-md mx-auto sm:mx-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="w-full">
                <TabsTrigger value="available" className="flex-1">For Rent</TabsTrigger>
                <TabsTrigger value="my-properties" className="flex-1">My Properties</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowListOnly(!showListOnly)}
              className="hidden sm:flex items-center gap-1"
            >
              {showListOnly ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                  <span className="ml-1">Map View</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  <span className="ml-1">List Only</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={() => document.getElementById('filters-dialog')?.click()}>
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="City, address, zip..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchTerm.length > 1 && citySuggestions.length > 0) {
                    setShowCitySuggestions(true);
                  }
                }}
              />
              
              {/* City Suggestions Dropdown */}
              {showCitySuggestions && (
                <div 
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  <ul className="py-1">
                    {citySuggestions.map((city, index) => (
                      <li 
                        key={index} 
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                        onClick={() => handleSelectCity(city)}
                      >
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {city}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {(searchTerm || bedroomsFilter !== "any" || propertyType !== "any" || priceRange[0] > 0 || priceRange[1] < 10000) && (
          <div className="px-4 py-2 border-b flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="outline" className="flex items-center gap-1">
                <span>Search: {searchTerm}</span>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setSearchTerm("")}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {bedroomsFilter !== "any" && (
              <Badge variant="outline" className="flex items-center gap-1">
                <span>Beds: {bedroomsFilter}</span>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setBedroomsFilter("any")}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {propertyType !== "any" && (
              <Badge variant="outline" className="flex items-center gap-1">
                <span>Type: {propertyType}</span>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setPropertyType("any")}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {(priceRange[0] > 0 || priceRange[1] < 10000) && (
              <Badge variant="outline" className="flex items-center gap-1">
                <span>Price: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}</span>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setPriceRange([0, 10000])}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
              setSearchTerm("");
              setBedroomsFilter("any");
              setPropertyType("any");
              setPriceRange([0, 10000]);
            }}>
              Clear all
            </Button>
          </div>
        )}
        
        {/* Results Count */}
        <div className="px-4 py-2 border-b bg-gray-50">
          <p className="text-sm">
            {sortedProperties.length === 0 ? 'No properties match your criteria' : 
              `${sortedProperties.length} ${sortedProperties.length === 1 ? 'property' : 'properties'} for ${activeTab === 'available' ? 'rent' : 'you'}`}
          </p>
        </div>
        
        {/* Main Content - Map and Listings */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left side - Map view */}
          {!showListOnly && (
            <div className="w-1/2 border-r bg-gray-100 hidden md:block">
              <div className="relative h-full">
                {/* Simple Map Placeholder */}
                <div className="absolute inset-0 bg-gray-200">
                  <div className="h-full w-full flex items-center justify-center flex-col">
                    <div className="w-full h-full overflow-hidden bg-gray-100 relative">
                      {/* Simulated Map Background */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23bbb' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                          backgroundSize: '200px 200px',
                          backgroundRepeat: 'repeat'
                        }}
                      ></div>
                      
                      {/* Property Price Markers */}
                      {sortedProperties.map((property, index) => {
                        // Generate pseudo-random positions for property markers
                        // Use property.id or index to generate different positions
                        const seed = property.id || index + 1;
                        const left = ((seed * 17) % 80) + 10;
                        const top = ((seed * 23) % 80) + 10;
                        
                        return (
                          <div 
                            key={property.id}
                            className={`absolute px-2 py-1 bg-white shadow-md rounded-md text-sm font-medium cursor-pointer transition-all transform hover:scale-110 ${hoveredProperty === property.id ? 'z-10 scale-110 ring-2 ring-primary' : 'z-0'}`}
                            style={{ 
                              left: `${left}%`, 
                              top: `${top}%`,
                            }}
                            onMouseEnter={() => setHoveredProperty(property.id)}
                            onMouseLeave={() => setHoveredProperty(null)}
                          >
                            {formatCurrency(property.monthlyRent || 0)}
                          </div>
                        );
                      })}
                      
                      {/* Map Controls */}
                      <div className="absolute left-4 top-4 flex flex-col gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 bg-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 bg-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 bg-white py-1 px-2 text-xs rounded shadow-sm">
                      Map data simulation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Right side - Property listings */}
          <div className={`${showListOnly ? 'w-full' : 'w-full md:w-1/2'} overflow-auto`}>
            {isLoading ? (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-48 bg-gray-200 animate-pulse" />
                    <CardContent className="p-6">
                      <div className="h-6 w-3/4 bg-gray-200 animate-pulse mb-3" />
                      <div className="h-4 w-1/2 bg-gray-200 animate-pulse mb-4" />
                      <div className="flex gap-4 mb-4">
                        <div className="h-4 w-20 bg-gray-200 animate-pulse" />
                        <div className="h-4 w-20 bg-gray-200 animate-pulse" />
                        <div className="h-4 w-20 bg-gray-200 animate-pulse" />
                      </div>
                      <div className="h-10 bg-gray-200 animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedProperties.length > 0 ? (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedProperties.map(property => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    viewMode="grid"
                    onScheduleViewing={() => handleScheduleViewing(property.id)}
                    onApplyNow={() => handleApplyForProperty(property.id)}
                    onClick={() => {/* View property details */}}
                    showMatchPercentage={false}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4">
                <Card>
                  <CardHeader>
                    <CardTitle>No properties found</CardTitle>
                    <CardDescription>
                      Try adjusting your filters to see more results
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <Home className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-center max-w-md">
                      We couldn't find any properties matching your criteria.
                      Try broadening your search or check back later for new listings.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline" onClick={() => {
                      setSearchTerm("");
                      setBedroomsFilter("any");
                      setPropertyType("any");
                      setPriceRange([0, 10000]);
                    }}>
                      Clear all filters
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
      </div>
      
      {/* Filters Dialog */}
      <Dialog>
        <DialogTrigger id="filters-dialog" className="hidden">Open Filters</DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Filter Properties</DialogTitle>
            <DialogDescription>
              Narrow down your property search with these filters.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 p-1">
              {/* Price Range */}
              <div>
                <Label className="mb-2 block">Price Range</Label>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Min: {formatCurrency(priceRange[0])}</span>
                  <span>Max: {formatCurrency(priceRange[1])}</span>
                </div>
                <Slider
                  min={0}
                  max={10000}
                  step={50}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-2"
                />
              </div>
              
              {/* Bedrooms */}
              <div>
                <Label className="mb-2 block">Bedrooms</Label>
                <RadioGroup value={bedroomsFilter} onValueChange={setBedroomsFilter}>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="any" id="any-bedrooms" />
                      <Label htmlFor="any-bedrooms">Any</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="one-bedroom" />
                      <Label htmlFor="one-bedroom">1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="two-bedrooms" />
                      <Label htmlFor="two-bedrooms">2</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="three-bedrooms" />
                      <Label htmlFor="three-bedrooms">3</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4+" id="four-plus-bedrooms" />
                      <Label htmlFor="four-plus-bedrooms">4+</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Property Type */}
              <div>
                <Label className="mb-2 block">Property Type</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Type</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="duplex">Duplex</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setBedroomsFilter("any");
              setPropertyType("any");
              setPriceRange([0, 10000]);
            }}>
              Reset
            </Button>
            <Button type="submit">Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Schedule Viewing Dialog */}
      <Dialog open={viewingDialogOpen} onOpenChange={setViewingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule a Viewing</DialogTitle>
            <DialogDescription>
              Choose a date and time that works for you to see this property.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="viewing-date" className="text-right">
                Date & Time
              </Label>
              <Input
                id="viewing-date"
                type="datetime-local"
                className="col-span-3"
                value={viewingDate}
                onChange={(e) => setViewingDate(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="viewing-notes" className="text-right">
                Notes
              </Label>
              <textarea
                id="viewing-notes"
                className="col-span-3 flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Any special requests or questions?"
                value={viewingNotes}
                onChange={(e) => setViewingNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setViewingDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={submitViewingRequest} disabled={!viewingDate}>
              Request Viewing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Properly close all opened divs */}
      </div> {/* Closing for flex-1 flex overflow-hidden */}
      </div> {/* Closing for flex flex-col h-[calc(100vh-64px)] */}
    </AppLayout>
  );
}