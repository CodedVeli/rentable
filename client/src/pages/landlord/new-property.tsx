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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Building, Home, Upload } from "lucide-react";

// Extend the insert property schema with additional validation
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
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export default function NewProperty() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isUploading, setIsUploading] = useState(false);

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
      addressProvince: "",
      addressPostalCode: "",
      bedrooms: 1,
      bathrooms: 1,
      areaSquareFeet: undefined,
      monthlyRent: undefined,
      depositAmount: undefined,
      availableFrom: undefined,
      leaseEndDate: undefined,
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
    
    // Convert dollars to cents for storage in the database
    const formattedData = {
      ...data,
      monthlyRent: data.monthlyRent * 100, // Already validated above
      depositAmount: data.depositAmount ? data.depositAmount * 100 : undefined,
    };
    createPropertyMutation.mutate(formattedData as any); // Type assertion to bypass TS error
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
          <h1 className="text-2xl font-bold">Add New Property</h1>
          <p className="text-gray-600 mt-1">
            Create a new property listing to attract potential tenants.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>
                  Provide basic information about your property.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Hidden landlord ID field */}
                    <input
                      type="hidden"
                      {...form.register("landlordId", { valueAsNumber: true })}
                      value={user?.id}
                    />

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
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? "" : parseInt(e.target.value);
                                    field.onChange(value);
                                  }}
                                />
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
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Pricing and Dates */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Pricing and Availability</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="monthlyRent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Rent (CAD)*</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="e.g., 2000"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>Enter amount in dollars (not cents)</FormDescription>
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
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="Optional"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>Enter amount in dollars (not cents)</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="availableFrom"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Available From</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  placeholder="Select date"
                                  {...field}
                                  value={field.value instanceof Date ? field.value.toISOString().substring(0, 10) : ''}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? undefined : new Date(e.target.value);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="leaseEndDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lease End Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  placeholder="Select date"
                                  {...field}
                                  value={field.value instanceof Date ? field.value.toISOString().substring(0, 10) : ''}
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? undefined : new Date(e.target.value);
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t">
                      <Button
                        type="submit"
                        className="w-full md:w-auto"
                        disabled={createPropertyMutation.isPending}
                      >
                        {createPropertyMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Property
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Property Photos Section */}
            <Card>
              <CardHeader>
                <CardTitle>Property Photos</CardTitle>
                <CardDescription>
                  Upload photos of your property to attract tenants.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Tips for Landlords */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Landlords</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <Home className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Provide accurate and detailed descriptions</span>
                  </li>
                  <li className="flex gap-2">
                    <Home className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Upload high-quality photos from different angles</span>
                  </li>
                  <li className="flex gap-2">
                    <Home className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Set a competitive rent price based on market research</span>
                  </li>
                  <li className="flex gap-2">
                    <Home className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Regularly update property availability status</span>
                  </li>
                  <li className="flex gap-2">
                    <Home className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Respond promptly to tenant inquiries</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}