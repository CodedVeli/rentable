import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { insertPropertySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";

// Extend the insert schema to include additional validation
const propertyFormSchema = insertPropertySchema.extend({
  addressPostalCode: z.string().regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, {
    message: "Please enter a valid Canadian postal code (e.g., M5V 2A1)",
  }),
  monthlyRent: z.coerce.number().positive("Rent must be greater than 0"),
  bedrooms: z.coerce.number().int().positive("Bedrooms must be greater than 0"),
  bathrooms: z.coerce.number().positive("Bathrooms must be greater than 0"),
  areaSquareFeet: z.coerce.number().int().positive("Area must be greater than 0"),
  depositAmount: z.coerce.number().optional(),
});

// Define the form input type
type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  propertyToEdit?: any; // Would be Property type in a real app
}

export default function PropertyModal({ 
  isOpen, 
  onClose, 
  onSave,
  propertyToEdit
}: PropertyModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing property data if editing
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: propertyToEdit ? {
      ...propertyToEdit,
      monthlyRent: propertyToEdit.monthlyRent / 100, // Convert from cents to dollars for display
      depositAmount: propertyToEdit.depositAmount ? propertyToEdit.depositAmount / 100 : undefined,
    } : {
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
      areaSquareFeet: 0,
      monthlyRent: 0,
      depositAmount: undefined,
      landlordId: user?.id,
    },
  });

  // Handle form submission
  const onSubmit = async (data: PropertyFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a property",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert dollar amounts to cents for storage
      const formattedData = {
        ...data,
        landlordId: user.id,
        monthlyRent: Math.round(data.monthlyRent * 100),
        depositAmount: data.depositAmount ? Math.round(data.depositAmount * 100) : undefined,
      };

      // Create or update property
      const endpoint = propertyToEdit 
        ? `/api/properties/${propertyToEdit.id}` 
        : "/api/properties";
      
      const method = propertyToEdit ? "PATCH" : "POST";

      await apiRequest(method, endpoint, formattedData);

      // Invalidate properties query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });

      // Show success toast
      toast({
        title: propertyToEdit ? "Property updated" : "Property created",
        description: propertyToEdit 
          ? "Your property has been updated successfully" 
          : "Your property has been created successfully",
      });

      // Call onSave callback and close modal
      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save property",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {propertyToEdit ? "Edit Property" : "Add New Property"}
          </DialogTitle>
          <DialogDescription>
            {propertyToEdit 
              ? "Update the details of your property" 
              : "Add a new property to list on the platform"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Modern Downtown Condo" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
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
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
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

            <FormField
              control={form.control}
              name="addressStreet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="addressCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
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
                    <FormLabel>Province</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ON">Ontario</SelectItem>
                        <SelectItem value="BC">British Columbia</SelectItem>
                        <SelectItem value="AB">Alberta</SelectItem>
                        <SelectItem value="QC">Quebec</SelectItem>
                        <SelectItem value="MB">Manitoba</SelectItem>
                        <SelectItem value="SK">Saskatchewan</SelectItem>
                        <SelectItem value="NS">Nova Scotia</SelectItem>
                        <SelectItem value="NB">New Brunswick</SelectItem>
                        <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                        <SelectItem value="PE">Prince Edward Island</SelectItem>
                        <SelectItem value="NT">Northwest Territories</SelectItem>
                        <SelectItem value="YT">Yukon</SelectItem>
                        <SelectItem value="NU">Nunavut</SelectItem>
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
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="A1A 1A1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="2" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.5" 
                        placeholder="1.5" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                    <FormLabel>Area (sq.ft)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="850" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="monthlyRent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rent (CAD)</FormLabel>
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
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter the monthly rent amount in Canadian dollars
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
                          const value = e.target.value === "" ? undefined : e.target.valueAsNumber;
                          field.onChange(value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter the security deposit amount (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Property description and details" 
                      className="h-24" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Property Photos</FormLabel>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload files</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {propertyToEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  propertyToEdit ? "Save Property" : "Create Property"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
