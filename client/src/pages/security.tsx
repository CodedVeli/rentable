import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SecurityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State for two-factor authentication
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  
  // State for login notification
  const [loginNotifications, setLoginNotifications] = useState(true);
  
  // State for security questions
  const [securityQuestion1, setSecurityQuestion1] = useState("");
  const [securityQuestion2, setSecurityQuestion2] = useState("");
  const [securityAnswer1, setSecurityAnswer1] = useState("");
  const [securityAnswer2, setSecurityAnswer2] = useState("");
  
  // State for authorized devices
  const [authorizedDevices, setAuthorizedDevices] = useState([
    { id: 1, name: "Chrome on Windows", lastAccess: "2025-04-02T14:30:00", location: "Toronto, Canada", isCurrent: true },
    { id: 2, name: "Safari on iPhone", lastAccess: "2025-04-01T10:15:00", location: "Toronto, Canada", isCurrent: false },
    { id: 3, name: "Firefox on MacBook", lastAccess: "2025-03-25T08:45:00", location: "Vancouver, Canada", isCurrent: false },
  ]);
  
  // Password strength checker
  const checkPasswordStrength = (password: string): { strength: string, color: string } => {
    if (!password) return { strength: 'None', color: 'text-gray-400' };
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;
    
    const criteria = [hasLower, hasUpper, hasNumber, hasSpecial, hasMinLength];
    const metCriteria = criteria.filter(Boolean).length;
    
    if (metCriteria <= 2) return { strength: 'Weak', color: 'text-red-500' };
    if (metCriteria === 3) return { strength: 'Fair', color: 'text-orange-500' };
    if (metCriteria === 4) return { strength: 'Good', color: 'text-blue-500' };
    return { strength: 'Strong', color: 'text-green-500' };
  };
  
  const passwordStrength = checkPasswordStrength(newPassword);
  
  // Validation error check 
  const getPasswordErrors = () => {
    const errors = [];
    
    if (newPassword && newPassword.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    
    if (newPassword && !/[A-Z]/.test(newPassword)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    
    if (newPassword && !/[a-z]/.test(newPassword)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    
    if (newPassword && !/[0-9]/.test(newPassword)) {
      errors.push("Password must contain at least one number");
    }
    
    if (newPassword && !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      errors.push("Password must contain at least one special character");
    }
    
    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      errors.push("Passwords do not match");
    }
    
    return errors;
  };
  
  const passwordErrors = getPasswordErrors();
  
  // Handle password change
  const handleChangePassword = () => {
    if (passwordErrors.length > 0) {
      return;
    }
    
    // This would normally call an API endpoint
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
    
    // Reset fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };
  
  // Handle two-factor toggle
  const handleTwoFactorToggle = (checked: boolean) => {
    if (checked && !twoFactorEnabled) {
      // Open setup dialog if enabling
      setTwoFactorSetupOpen(true);
    } else if (!checked && twoFactorEnabled) {
      // Disable two-factor authentication
      setTwoFactorEnabled(false);
      toast({
        title: "Two-Factor Authentication Disabled",
        description: "Your account is now less secure. We recommend enabling this feature.",
        variant: "destructive",
      });
    }
  };
  
  // Handle two-factor setup
  const handleTwoFactorSetup = () => {
    // This would normally verify the code with an API
    if (verificationCode === "123456") { // Simulated verification
      setTwoFactorEnabled(true);
      setTwoFactorSetupOpen(false);
      toast({
        title: "Two-Factor Authentication Enabled",
        description: "Your account is now more secure.",
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "Please check the verification code and try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle notifications toggle
  const handleNotificationsToggle = (checked: boolean) => {
    setLoginNotifications(checked);
    toast({
      title: `Login Notifications ${checked ? 'Enabled' : 'Disabled'}`,
      description: `You will ${checked ? 'now' : 'no longer'} receive notifications for new login attempts.`,
    });
  };
  
  // Handle security questions update
  const handleUpdateSecurityQuestions = () => {
    if (!securityQuestion1 || !securityAnswer1 || !securityQuestion2 || !securityAnswer2) {
      toast({
        title: "Missing Information",
        description: "Please complete all security questions and answers.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Security Questions Updated",
      description: "Your security questions have been updated successfully.",
    });
  };
  
  // Handle device removal
  const handleRemoveDevice = (deviceId: number) => {
    setAuthorizedDevices(authorizedDevices.filter(device => device.id !== deviceId));
    toast({
      title: "Device Removed",
      description: "The device has been removed from your authorized devices.",
    });
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6 max-w-5xl">
        <div className="flex items-center mb-6">
          <Shield className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Account Security</h1>
        </div>
        
        <Tabs defaultValue="password" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="two-factor">Two-Factor Authentication</TabsTrigger>
            <TabsTrigger value="security-questions">Security Questions</TabsTrigger>
            <TabsTrigger value="devices">Authorized Devices</TabsTrigger>
          </TabsList>
          
          {/* Password Tab */}
          <TabsContent value="password" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Your Password</CardTitle>
                <CardDescription>
                  Ensure your account is using a strong, secure password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Password Strength */}
                  {newPassword && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm">Strength:</span>
                      <span className={`text-sm font-medium ${passwordStrength.color}`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Confirm New Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm your new password"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Password Requirements */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-sm mb-2">Password Requirements:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center">
                      {newPassword.length >= 8 ? (
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400 mr-1" />
                      )}
                      <span>At least 8 characters</span>
                    </li>
                    <li className="flex items-center">
                      {/[A-Z]/.test(newPassword) ? (
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400 mr-1" />
                      )}
                      <span>At least one uppercase letter</span>
                    </li>
                    <li className="flex items-center">
                      {/[a-z]/.test(newPassword) ? (
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400 mr-1" />
                      )}
                      <span>At least one lowercase letter</span>
                    </li>
                    <li className="flex items-center">
                      {/[0-9]/.test(newPassword) ? (
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400 mr-1" />
                      )}
                      <span>At least one number</span>
                    </li>
                    <li className="flex items-center">
                      {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? (
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400 mr-1" />
                      )}
                      <span>At least one special character</span>
                    </li>
                  </ul>
                </div>
                
                {/* Password Match Check */}
                {newPassword && confirmNewPassword && (
                  <div className="flex items-center">
                    {newPassword === confirmNewPassword ? (
                      <>
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-500">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm text-red-500">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
                
                {/* Password Error Messages */}
                {passwordErrors.length > 0 && newPassword && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 space-y-1">
                        {passwordErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleChangePassword}
                  disabled={
                    !currentPassword || 
                    passwordErrors.length > 0 || 
                    !newPassword || 
                    !confirmNewPassword
                  }
                >
                  Update Password
                </Button>
              </CardFooter>
            </Card>
            
            {/* Login Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Login Notifications</CardTitle>
                <CardDescription>
                  Get notified when someone logs into your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="login-notifications">Email notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive emails when a new login is detected
                    </p>
                  </div>
                  <Switch
                    id="login-notifications"
                    checked={loginNotifications}
                    onCheckedChange={handleNotificationsToggle}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Two-Factor Authentication Tab */}
          <TabsContent value="two-factor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">
                      Use an authenticator app to generate verification codes
                    </p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={twoFactorEnabled}
                    onCheckedChange={handleTwoFactorToggle}
                  />
                </div>
                
                {twoFactorEnabled && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertTitle>Two-Factor Authentication is enabled</AlertTitle>
                    <AlertDescription>
                      Your account is more secure. You'll need your phone to sign in.
                    </AlertDescription>
                  </Alert>
                )}
                
                {!twoFactorEnabled && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Your account is at risk</AlertTitle>
                    <AlertDescription>
                      Two-factor authentication adds an important layer of security. 
                      We strongly recommend enabling it.
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Two-Factor Setup Dialog */}
                <Dialog open={twoFactorSetupOpen} onOpenChange={setTwoFactorSetupOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
                      <DialogDescription>
                        Scan the QR code with your authenticator app or enter the setup key manually.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex flex-col items-center justify-center space-y-5 py-4">
                      {/* QR Code (this would be generated server-side in a real app) */}
                      <div className="w-48 h-48 bg-gray-100 flex items-center justify-center border">
                        <Lock className="h-20 w-20 text-gray-400" />
                        <span className="sr-only">QR Code</span>
                      </div>
                      
                      <p className="text-sm text-center">
                        Can't scan the QR code? Use this code instead:
                      </p>
                      
                      <div className="bg-gray-100 px-4 py-2 rounded font-mono text-sm select-all">
                        ABCD-EFGH-IJKL-MNOP
                      </div>
                      
                      <div className="space-y-2 w-full">
                        <Label htmlFor="verification-code">Enter verification code</Label>
                        <Input
                          id="verification-code"
                          placeholder="123456"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          className="text-center text-lg tracking-widest"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter className="sm:justify-start">
                      <Button
                        type="submit"
                        onClick={handleTwoFactorSetup}
                        disabled={verificationCode.length !== 6}
                      >
                        Verify and Enable
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setTwoFactorSetupOpen(false)}
                      >
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
            
            {/* Recovery Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Recovery Methods</CardTitle>
                <CardDescription>
                  Ensure you can recover your account if you lose access to your authentication device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recovery Email */}
                <div className="space-y-2">
                  <Label htmlFor="recovery-email">Recovery Email</Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                  />
                  <p className="text-sm text-gray-500">
                    Recovery codes and instructions will be sent to this email
                  </p>
                </div>
                
                {/* Recovery Phone */}
                <div className="space-y-2">
                  <Label htmlFor="recovery-phone">Recovery Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="recovery-phone"
                      type="tel"
                      placeholder="(123) 456-7890"
                      defaultValue=""
                    />
                    <Button variant="outline">Verify</Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Add a phone number for SMS verification
                  </p>
                </div>
                
                {/* Backup Codes */}
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    Generate Backup Codes
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Backup codes can be used to access your account if you lose your phone
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Questions Tab */}
          <TabsContent value="security-questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Questions</CardTitle>
                <CardDescription>
                  Set up security questions to help verify your identity if you forget your password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question 1 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="security-question-1">Security Question 1</Label>
                    <select
                      id="security-question-1"
                      className="w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={securityQuestion1}
                      onChange={(e) => setSecurityQuestion1(e.target.value)}
                    >
                      <option value="" disabled>Select a question</option>
                      <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                      <option value="What was the name of your first school?">What was the name of your first school?</option>
                      <option value="What city were you born in?">What city were you born in?</option>
                      <option value="What was your childhood nickname?">What was your childhood nickname?</option>
                      <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="security-answer-1">Your Answer</Label>
                    <Input
                      id="security-answer-1"
                      type="text"
                      value={securityAnswer1}
                      onChange={(e) => setSecurityAnswer1(e.target.value)}
                      placeholder="Enter your answer"
                    />
                  </div>
                </div>
                
                <Separator />
                
                {/* Question 2 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="security-question-2">Security Question 2</Label>
                    <select
                      id="security-question-2"
                      className="w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={securityQuestion2}
                      onChange={(e) => setSecurityQuestion2(e.target.value)}
                    >
                      <option value="" disabled>Select a question</option>
                      <option value="What was the model of your first car?">What was the model of your first car?</option>
                      <option value="What is the name of the street you grew up on?">What is the name of the street you grew up on?</option>
                      <option value="What was your favorite subject in high school?">What was your favorite subject in high school?</option>
                      <option value="What is your favorite book?">What is your favorite book?</option>
                      <option value="What was the first concert you attended?">What was the first concert you attended?</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="security-answer-2">Your Answer</Label>
                    <Input
                      id="security-answer-2"
                      type="text"
                      value={securityAnswer2}
                      onChange={(e) => setSecurityAnswer2(e.target.value)}
                      placeholder="Enter your answer"
                    />
                  </div>
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Make sure to choose questions with answers that don't change over time and that only you would know.
                    Your answers are case-sensitive and must be entered exactly as you provide them here.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleUpdateSecurityQuestions}
                  disabled={!securityQuestion1 || !securityAnswer1 || !securityQuestion2 || !securityAnswer2}
                >
                  Save Security Questions
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Authorized Devices Tab */}
          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Authorized Devices</CardTitle>
                <CardDescription>
                  Manage the devices that have access to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {authorizedDevices.map((device) => (
                  <div key={device.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Smartphone className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{device.name}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(device.lastAccess).toLocaleString()} • {device.location}
                        </p>
                        {device.isCurrent && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            Current Device
                          </span>
                        )}
                      </div>
                    </div>
                    {!device.isCurrent && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveDevice(device.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Session Management</AlertTitle>
                  <AlertDescription>
                    Removing a device will end that session and require logging in again on that device.
                    If you don't recognize a device, remove it immediately and change your password.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Sign Out All Other Devices</Button>
              </CardFooter>
            </Card>
            
            {/* Recent Account Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Account Activity</CardTitle>
                <CardDescription>
                  View your recent login activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Successful Login</h4>
                        <p className="text-sm text-gray-500">Toronto, Canada • 2 hours ago</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Successful
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Password Changed</h4>
                        <p className="text-sm text-gray-500">Toronto, Canada • 3 days ago</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Security
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Failed Login Attempt</h4>
                        <p className="text-sm text-gray-500">Montreal, Canada • 5 days ago</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Failed
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">View Full Activity Log</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}