import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Info, Camera, Upload, Shield, User, Lock } from "lucide-react";
import { Loader2 } from "lucide-react";

// Profile schema
const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  addressStreet: z.string().min(1, "Street address is required"),
  addressCity: z.string().min(1, "City is required"),
  addressProvince: z.string().min(1, "Province is required"),
  addressPostalCode: z.string().regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, "Please enter a valid Canadian postal code"),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(8, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
      email: user?.email || "",
      addressStreet: user?.addressStreet || "",
      addressCity: user?.addressCity || "",
      addressProvince: user?.addressProvince || "",
      addressPostalCode: user?.addressPostalCode || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ProfileFormValues) => {
      const res = await apiRequest("PATCH", `/api/user/${user?.id}`, profileData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: PasswordFormValues) => {
      const res = await apiRequest("POST", "/api/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully",
      });
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to change password",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // ID verification - simplified for demo
  const verifyIDMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/verification/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload document");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Document uploaded",
        description: "Your document has been submitted for verification",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to upload document",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle profile form submission
  const onSubmitProfile = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  // Handle password form submission
  const onSubmitPassword = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };
  
  // Handle ID document upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentType", "government_id");
    
    verifyIDMutation.mutate(formData);
  };
  
  return (
    <AppLayout>
      <div className="py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Profile</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={user?.profileImage || undefined} />
                      <AvatarFallback className="text-lg">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-500 mb-2">
                      <Badge className="mt-2 capitalize">
                        {user?.role}
                      </Badge>
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">Email verified</p>
                      <Badge variant="success">Verified</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">ID verification</p>
                      <Badge
                        variant={
                          user?.verificationStatus === "verified"
                            ? "success"
                            : user?.verificationStatus === "pending"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {user?.verificationStatus === "verified"
                          ? "Verified"
                          : user?.verificationStatus === "pending"
                          ? "Pending"
                          : "Not verified"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">Profile completion</p>
                      <p className="text-sm font-medium text-primary-600">80%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: "80%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="account" className="flex-1">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex-1">
                    <Lock className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="verification" className="flex-1">
                    <Shield className="h-4 w-4 mr-2" />
                    Verification
                  </TabsTrigger>
                </TabsList>
                
                {/* Account Tab */}
                <TabsContent value="account">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="phoneNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="416-555-1234" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Address Information</h3>
                            <div className="space-y-4">
                              <FormField
                                control={profileForm.control}
                                name="addressStreet"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Street Address</FormLabel>
                                    <FormControl>
                                      <Input placeholder="123 Main St" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                  control={profileForm.control}
                                  name="addressCity"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>City</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Toronto" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={profileForm.control}
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
                                  control={profileForm.control}
                                  name="addressPostalCode"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Postal Code</FormLabel>
                                      <FormControl>
                                        <Input placeholder="M5V 2A1" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              disabled={updateProfileMutation.isPending}
                            >
                              {updateProfileMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Security Tab */}
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your password and security preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Password must be at least 8 characters and include a mix of uppercase, lowercase, and numbers.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              disabled={changePasswordMutation.isPending}
                            >
                              {changePasswordMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Changing Password...
                                </>
                              ) : (
                                "Change Password"
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                      
                      <Separator className="my-6" />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Account Activity</h3>
                        <div className="rounded-md border p-4 bg-gray-50">
                          <div className="flex items-start">
                            <Info className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Login Activity</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Last login: {new Date().toLocaleDateString('en-CA')} at{' '}
                                {new Date().toLocaleTimeString('en-CA', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Verification Tab */}
                <TabsContent value="verification">
                  <Card>
                    <CardHeader>
                      <CardTitle>Identity Verification</CardTitle>
                      <CardDescription>
                        Verify your identity to access all platform features
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="rounded-md border p-4">
                          <div className="flex items-start">
                            <Shield className="h-5 w-5 text-primary-600 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Government ID Verification</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Upload a government-issued ID to verify your identity
                              </p>
                              <div className="mt-4">
                                <div className="flex items-center">
                                  <Badge
                                    variant={
                                      user?.verificationStatus === "verified"
                                        ? "success"
                                        : user?.verificationStatus === "pending"
                                        ? "outline"
                                        : "secondary"
                                    }
                                    className="mr-2"
                                  >
                                    {user?.verificationStatus === "verified"
                                      ? "Verified"
                                      : user?.verificationStatus === "pending"
                                      ? "Pending"
                                      : "Not verified"}
                                  </Badge>
                                  
                                  {user?.verificationStatus !== "verified" && (
                                    <div className="relative">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                          user?.verificationStatus === "pending" ||
                                          verifyIDMutation.isPending
                                        }
                                      >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {verifyIDMutation.isPending
                                          ? "Uploading..."
                                          : user?.verificationStatus === "pending"
                                          ? "Awaiting Review"
                                          : "Upload ID Document"}
                                      </Button>
                                      <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={
                                          user?.verificationStatus === "pending" ||
                                          verifyIDMutation.isPending
                                        }
                                        onChange={handleDocumentUpload}
                                      />
                                    </div>
                                  )}
                                </div>
                                
                                {user?.verificationStatus === "pending" && (
                                  <p className="text-sm text-amber-600 mt-2">
                                    Your ID is currently under review. This usually takes 1-2 business days.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-md border p-4">
                          <div className="flex items-start">
                            <Info className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Why we need verification</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Identity verification helps us maintain a secure and trustworthy platform for all users.
                                Verified users have access to:
                              </p>
                              <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                                <li>Applying for rental properties</li>
                                <li>Signing legal lease agreements</li>
                                <li>Processing and receiving payments</li>
                                <li>Enhanced account security</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-md border p-4 bg-primary-50">
                          <div className="flex items-start">
                            <Shield className="h-5 w-5 text-primary-600 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Data Security</p>
                              <p className="text-sm text-gray-700 mt-1">
                                Your data is encrypted and securely stored in compliance with privacy regulations.
                                We never share your personal information with third parties without your explicit consent.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
