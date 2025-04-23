import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertPropertySchema } from "@shared/schema";
import { useLocation } from "wouter";
import AppLayout from "@/components/layout/app-layout";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Loader2,
  ArrowLeft,
  Building,
  Home,
  Upload,
  CalendarIcon,
  BedDouble,
  Bath,
  SquareCode,
  DollarSign,
  CheckCircle,
  Car,
  Wifi,
  Trash2,
  PlusCircle,
  XCircle,
  ParkingSquare,
  Utensils,
  Wind,
  Snowflake,
  Waves,
  Trees,
  PawPrint
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Extend the insert property schema with additional validation and fields
const propertyFormSchema = insertPropertySchema.extend({
  // Convert string values to numbers where needed
  bedrooms: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number().min(0, { message: "Bedrooms must be 0 or more" })
  ),
  bathrooms: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number().min(0, { message: "Bathrooms must be 0 or more" })
  ),
  areaSquareFeet: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number().optional()
  ),
  monthlyRent: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number().min(1, { message: "Monthly rent is required" })
  ),
  depositAmount: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number().optional()
  ),
  availableFrom: z.preprocess(
    (value) => (value === "" ? undefined : new Date(value as string)),
    z.date().optional()
  ),
  leaseEndDate: z.preprocess(
    (value) => (value === "" ? undefined : new Date(value as string)),
    z.date().optional()
  ),
  // Additional fields for detailed property information
  propertyType: z.enum(["apartment", "condo", "house", "townhouse", "other"]),
  parkingSpots: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number().min(0).optional()
  ),
  isFurnished: z.boolean().optional().default(false),
  petsAllowed: z.boolean().optional().default(false),
  petDeposit: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number().optional()
  ),
  smokingAllowed: z.boolean().optional().default(false),
  hasAirConditioning: z.boolean().optional().default(false),
  hasHeating: z.boolean().optional().default(false),
  hasWasherDryer: z.boolean().optional().default(false),
  hasDishwasher: z.boolean().optional().default(false),
  hasBalcony: z.boolean().optional().default(false),
  hasStorage: z.boolean().optional().default(false),
  hasGym: z.boolean().optional().default(false),
  hasPool: z.boolean().optional().default(false),
  utilityWater: z.boolean().optional().default(false),
  utilityElectricity: z.boolean().optional().default(false),
  utilityGas: z.boolean().optional().default(false),
  utilityInternet: z.boolean().optional().default(false),
  utilityCable: z.boolean().optional().default(false),
  yearBuilt: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number().optional()
  ),
  propertyTaxes: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number().optional()
  ),
  insuranceRequired: z.boolean().optional().default(false),
  customFeatures: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
  })).optional().default([]),
  leaseTerms: z.string().optional(),
  virtualTourUrl: z.string().url().optional().or(z.literal("")),
  additionalNotes: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export default function PropertyDetails() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [newFeature, setNewFeature] = useState("");
  const [customFeatures, setCustomFeatures] = useState<{id: string, name: string}[]>([]);

  // Initialize form with default values
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      landlordId: user?.id,
      title: "",
      description: "",
      propertyType: "apartment",
      status: "available",
      addressStreet: "",
      addressCity: "",
      addressProvince: "ON",
      addressPostalCode: "",
      bedrooms: 1,
      bathrooms: 1,
      areaSquareFeet: undefined,
      monthlyRent: undefined,
      depositAmount: undefined,
      availableFrom: undefined,
      leaseEndDate: undefined,
      parkingSpots: 0,
      isFurnished: false,
      petsAllowed: false,
      petDeposit: undefined,
      smokingAllowed: false,
      hasAirConditioning: false,
      hasHeating: true,
      hasWasherDryer: false,
      hasDishwasher: false,
      hasBalcony: false,
      hasStorage: false,
      hasGym: false,
      hasPool: false,
      utilityWater: false,
      utilityElectricity: false,
      utilityGas: false,
      utilityInternet: false,
      utilityCable: false,
      yearBuilt: undefined,
      propertyTaxes: undefined,
      insuranceRequired: false,
      customFeatures: [],
      leaseTerms: "",
      virtualTourUrl: "",
      additionalNotes: "",
    },
  });

  // Mutation for creating a new property
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormValues) => {
      const res = await apiRequest("POST", "/api/property", data);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate both single and multiple property endpoints to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/property"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property created",
        description: "Your property has been created successfully.",
      });
      navigate("/landlord/properties");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create property",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PropertyFormValues) => {
    // Ensure required fields are present before submission
    if (!data.monthlyRent) {
      toast({
        title: "Validation error",
        description: "Monthly rent is required",
        variant: "destructive",
      });
      return;
    }
    
    // Include custom features in the submission data
    const submissionData = {
      ...data,
      customFeatures: customFeatures,
      // Convert dollars to cents for storage in the database
      monthlyRent: data.monthlyRent * 100, // Already validated above
      depositAmount: data.depositAmount ? data.depositAmount * 100 : undefined,
      petDeposit: data.petDeposit ? data.petDeposit * 100 : undefined,
      propertyTaxes: data.propertyTaxes ? data.propertyTaxes * 100 : undefined,
    };
    
    createPropertyMutation.mutate(submissionData as any); // Type assertion to bypass TS error
  };

  // Function to handle image uploads (placeholder for future implementation)
  const handleImageUpload = () => {
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Image upload",
        description: "This feature will be implemented soon.",
      });
    }, 1500);
  };

  // Function to add a custom feature
  const addCustomFeature = () => {
    if (newFeature.trim() === "") return;
    
    const feature = {
      id: `feature-${Date.now()}`,
      name: newFeature.trim()
    };
    
    setCustomFeatures([...customFeatures, feature]);
    setNewFeature("");
  };

  // Function to remove a custom feature
  const removeCustomFeature = (id: string) => {
    setCustomFeatures(customFeatures.filter(feature => feature.id !== id));
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 md:px-8">
        <div className="mb-8">
          <Button
            onClick={() => navigate("/landlord/properties")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
          <h1 className="text-2xl font-bold">Add Detailed Property</h1>
          <p className="text-gray-600 mt-1">
            Create a comprehensive property listing with all details to attract the best tenants.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="basic" className="text-sm">Basic Information</TabsTrigger>
            <TabsTrigger value="features" className="text-sm">Features & Amenities</TabsTrigger>
            <TabsTrigger value="financials" className="text-sm">Financial Details</TabsTrigger>
            <TabsTrigger value="media" className="text-sm">Media & Documents</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Hidden landlord ID field */}
              <input
                type="hidden"
                {...form.register("landlordId", { valueAsNumber: true })}
                value={user?.id}
              />

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                    <CardDescription>
                      Provide basic information about your property.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Title*</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Modern Apartment in Downtown Toronto"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field: { onChange, onBlur, name, ref, ...rest } }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your property, including unique features, recent renovations, etc."
                                rows={4}
                                onChange={onChange}
                                onBlur={onBlur}
                                name={name}
                                ref={ref}
                                value={rest.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Property Type and Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="propertyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Type*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="apartment">Apartment</SelectItem>
                                <SelectItem value="condo">Condo</SelectItem>
                                <SelectItem value="house">House</SelectItem>
                                <SelectItem value="townhouse">Townhouse</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="rented">Rented</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="not_available">Not Available</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Address</h3>
                      <FormField
                        control={form.control}
                        name="addressStreet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address*</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St, Apt 4B" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="addressCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City*</FormLabel>
                              <FormControl>
                                <Input placeholder="Toronto" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="addressProvince"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Province*</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select province" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="AB">Alberta</SelectItem>
                                  <SelectItem value="BC">British Columbia</SelectItem>
                                  <SelectItem value="MB">Manitoba</SelectItem>
                                  <SelectItem value="NB">New Brunswick</SelectItem>
                                  <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                                  <SelectItem value="NS">Nova Scotia</SelectItem>
                                  <SelectItem value="ON">Ontario</SelectItem>
                                  <SelectItem value="PE">Prince Edward Island</SelectItem>
                                  <SelectItem value="QC">Quebec</SelectItem>
                                  <SelectItem value="SK">Saskatchewan</SelectItem>
                                  <SelectItem value="NT">Northwest Territories</SelectItem>
                                  <SelectItem value="NU">Nunavut</SelectItem>
                                  <SelectItem value="YT">Yukon</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="addressPostalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code*</FormLabel>
                              <FormControl>
                                <Input placeholder="M5V 2H1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Property Features */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Property Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="bedrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bedrooms*</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <BedDouble className="h-4 w-4 text-gray-500" />
                                  <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value === "" ? "" : parseInt(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bathrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bathrooms*</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Bath className="h-4 w-4 text-gray-500" />
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value === "" ? "" : parseFloat(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="areaSquareFeet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Area (sq ft)</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <SquareCode className="h-4 w-4 text-gray-500" />
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="Optional"
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value === "" ? "" : parseInt(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Parking Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Parking Information</h3>
                      <FormField
                        control={form.control}
                        name="parkingSpots"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Parking Spots</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Car className="h-4 w-4 text-gray-500" />
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? "" : parseInt(e.target.value);
                                    field.onChange(value);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Enter the number of parking spots included with this property
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Availability Dates */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Availability</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="availableFrom"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Available From</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={
                                        !field.value ? "text-muted-foreground" : ""
                                      }
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                When will this property be available for move-in?
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Features & Amenities</CardTitle>
                    <CardDescription>
                      Specify features and amenities available at this property.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Property Features */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="isFurnished"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Furnished</FormLabel>
                                <FormDescription>
                                  Does this property come furnished?
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hasWasherDryer"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Washer/Dryer</FormLabel>
                                <FormDescription>
                                  In-unit laundry facilities
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hasDishwasher"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Dishwasher</FormLabel>
                                <FormDescription>
                                  Property has a dishwasher
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hasAirConditioning"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Air Conditioning</FormLabel>
                                <FormDescription>
                                  Property has air conditioning
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hasHeating"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Heating</FormLabel>
                                <FormDescription>
                                  Property has heating system
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hasBalcony"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Balcony/Patio</FormLabel>
                                <FormDescription>
                                  Property has a balcony or patio
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Building Amenities */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Building Amenities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="hasStorage"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Storage</FormLabel>
                                <FormDescription>
                                  Storage space available
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hasGym"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Fitness Center</FormLabel>
                                <FormDescription>
                                  Building has fitness facilities
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hasPool"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Swimming Pool</FormLabel>
                                <FormDescription>
                                  Building has a swimming pool
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Pet Policy */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Pet Policy</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="petsAllowed"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Pets Allowed</FormLabel>
                                <FormDescription>
                                  Are pets allowed in this property?
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {form.watch("petsAllowed") && (
                          <FormField
                            control={form.control}
                            name="petDeposit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pet Deposit (CAD)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                      $
                                    </span>
                                    <Input 
                                      type="number"
                                      min="0" 
                                      step="0.01" 
                                      placeholder="0.00" 
                                      className="pl-7"
                                      value={field.value || ""}
                                      onChange={(e) => {
                                        const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                                        field.onChange(value);
                                      }}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Additional deposit required for pets
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>

                    {/* Smoking Policy */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Smoking Policy</h3>
                      <FormField
                        control={form.control}
                        name="smokingAllowed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Smoking Allowed</FormLabel>
                              <FormDescription>
                                Is smoking allowed in this property?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Utilities Included */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Utilities Included</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="utilityWater"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Water</FormLabel>
                                <FormDescription>
                                  Water bill included in rent
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="utilityElectricity"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Electricity</FormLabel>
                                <FormDescription>
                                  Electricity bill included in rent
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="utilityGas"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Gas</FormLabel>
                                <FormDescription>
                                  Gas bill included in rent
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="utilityInternet"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Internet</FormLabel>
                                <FormDescription>
                                  Internet service included in rent
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="utilityCable"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Cable TV</FormLabel>
                                <FormDescription>
                                  Cable TV service included in rent
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Custom Features */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Custom Features</h3>
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="Add a custom feature (e.g., Smart Home System)"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            type="button"
                            onClick={addCustomFeature}
                            disabled={!newFeature.trim()}
                            variant="outline"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                        
                        {customFeatures.length > 0 && (
                          <Card>
                            <CardHeader className="py-3">
                              <CardTitle className="text-sm font-medium">Added Features</CardTitle>
                            </CardHeader>
                            <CardContent className="py-2">
                              <ScrollArea className="h-[120px]">
                                <div className="space-y-2">
                                  {customFeatures.map((feature) => (
                                    <div 
                                      key={feature.id} 
                                      className="flex items-center justify-between rounded-md border p-2"
                                    >
                                      <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                                        <span>{feature.name}</span>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeCustomFeature(feature.id)}
                                      >
                                        <XCircle className="h-4 w-4 text-gray-500" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financials" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Details</CardTitle>
                    <CardDescription>
                      Provide financial information about the property.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Pricing and Dates */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Pricing</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="monthlyRent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Rent (CAD)*</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <DollarSign className="h-4 w-4" />
                                  </span>
                                  <Input 
                                    type="number"
                                    min="0" 
                                    step="0.01" 
                                    placeholder="0.00" 
                                    className="pl-8"
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const value = e.target.value === "" ? "" : parseFloat(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Monthly rent amount in Canadian dollars
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="depositAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Security Deposit (CAD)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <DollarSign className="h-4 w-4" />
                                  </span>
                                  <Input 
                                    type="number"
                                    min="0" 
                                    step="0.01" 
                                    placeholder="0.00" 
                                    className="pl-8"
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Security deposit amount (typically one month's rent)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Property Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Property Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="yearBuilt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year Built</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="1800"
                                  max={new Date().getFullYear()}
                                  placeholder="Optional"
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Year the property was built
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="propertyTaxes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Annual Property Taxes (CAD)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <DollarSign className="h-4 w-4" />
                                  </span>
                                  <Input 
                                    type="number"
                                    min="0" 
                                    step="0.01" 
                                    placeholder="0.00" 
                                    className="pl-8"
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Annual property tax amount
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Insurance */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Insurance Requirements</h3>
                      <FormField
                        control={form.control}
                        name="insuranceRequired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Tenant Insurance Required</FormLabel>
                              <FormDescription>
                                Is tenant insurance mandatory for this property?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Lease Terms */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Lease Terms</h3>
                      <FormField
                        control={form.control}
                        name="leaseTerms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lease Terms & Conditions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Specify any lease terms, minimum lease duration, renewal options, etc."
                                className="h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter any specific lease terms or conditions for tenants
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Media & Documentation</CardTitle>
                    <CardDescription>
                      Upload photos and documents related to the property.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Property Photos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Property Photos</h3>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                        <Building className="h-12 w-12 mx-auto text-gray-400" />
                        <h3 className="mt-4 text-sm font-medium text-gray-900">
                          Add Property Photos
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Upload high-quality images to showcase your property.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={handleImageUpload}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Upload Photos
                        </Button>
                      </div>
                    </div>

                    {/* Virtual Tour */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Virtual Tour</h3>
                      <FormField
                        control={form.control}
                        name="virtualTourUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Virtual Tour URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/virtual-tour"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter a URL to a virtual tour of the property (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Additional Notes</h3>
                      <FormField
                        control={form.control}
                        name="additionalNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any additional information about the property that tenants should know..."
                                className="h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Submit Button */}
              <div className="pt-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  * Required fields
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/landlord/properties")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="min-w-[120px]"
                    disabled={createPropertyMutation.isPending}
                  >
                    {createPropertyMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Property
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </AppLayout>
  );
}