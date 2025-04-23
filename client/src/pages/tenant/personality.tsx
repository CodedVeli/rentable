import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCog, Home, Users, AlertCircle, CheckCircle } from "lucide-react";
import AppLayout from "@/components/layout/app-layout";

const TraitBar = ({ name, value }: { name: string; value: number }) => {
  const percentage = (value / 10) * 100;
  
  return (
    <div className="w-full mb-4">
      <div className="flex justify-between mb-1 text-sm">
        <span>{name}</span>
        <span>{value}/10</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary rounded-full h-2" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const PersonalityProfile = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Fetch tenant personality profile
  const { 
    data: profileData, 
    isLoading: isProfileLoading,
    isError: isProfileError
  } = useQuery({
    queryKey: ['/api/personality-match/tenant-profile/me'],
    queryFn: async () => {
      const userId = localStorage.getItem('userId');
      const res = await apiRequest('GET', `/api/personality-match/tenant-profile/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch personality profile');
      return await res.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Generate personality profile mutation
  const generateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/personality-match/tenant-profile', {});
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to generate personality profile');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Generated",
        description: "Your personality profile has been successfully created.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/personality-match/tenant-profile/me'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate personality profile.",
        variant: "destructive",
      });
    }
  });
  
  const profile = profileData?.profile;
  const hasProfile = !!profile;
  
  const handleGenerateProfile = () => {
    generateProfileMutation.mutate();
  };
  
  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Personality Profile</h1>
        <Button 
          onClick={handleGenerateProfile}
          disabled={generateProfileMutation.isPending}
        >
          {generateProfileMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            hasProfile ? "Regenerate Profile" : "Generate Profile"
          )}
        </Button>
      </div>
      
      {!hasProfile && !generateProfileMutation.isPending && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <UserCog className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">No Personality Profile Yet</h3>
              <p className="text-center text-muted-foreground max-w-md">
                Generate your personality profile to discover insights about your tenant preferences and to find better matches with properties and landlords.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {hasProfile && (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="profile">Personality Traits</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle Factors</TabsTrigger>
            <TabsTrigger value="compatibility">Compatibility & Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personality Overview</CardTitle>
                <CardDescription>
                  {profile.overallDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Personality Traits</h3>
                    <TraitBar name="Cleanliness" value={profile.traits.cleanliness} />
                    <TraitBar name="Quietness" value={profile.traits.quietness} />
                    <TraitBar name="Sociability" value={profile.traits.sociability} />
                    <TraitBar name="Flexibility" value={profile.traits.flexibility} />
                    <TraitBar name="Reliability" value={profile.traits.reliability} />
                    <TraitBar name="Organization" value={profile.traits.organization} />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Communication & Expectations</h3>
                    <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Communication Style</span>
                        <p className="font-medium capitalize">{profile.communicationStyle}</p>
                      </div>
                      <Separator />
                      <div>
                        <span className="text-sm text-muted-foreground">Maintenance Expectations</span>
                        <p className="font-medium capitalize">{profile.maintenanceExpectations}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="lifestyle" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lifestyle Factors</CardTitle>
                <CardDescription>
                  Your living habits and preferences that influence your rental experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Work Style</h3>
                    <div className="flex items-center space-x-2">
                      {profile.lifestyle.workFromHome ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span>Work from home</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Schedule</h3>
                    <Badge variant="outline" className="capitalize">
                      {profile.lifestyle.typicalSchedule.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Social Habits</h3>
                    <Badge variant="outline" className="capitalize">
                      {`${profile.lifestyle.guestsFrequency} has guests`}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Pet Owner</h3>
                    <div className="flex items-center space-x-2">
                      {profile.lifestyle.petOwner ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span>{profile.lifestyle.petOwner ? 'Has pets' : 'No pets'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Smoker</h3>
                    <div className="flex items-center space-x-2">
                      {profile.lifestyle.smoker ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span>{profile.lifestyle.smoker ? 'Smoker' : 'Non-smoker'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="compatibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compatibility Preferences</CardTitle>
                <CardDescription>
                  Factors that determine your compatibility with properties and landlords
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Home className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Property Preferences</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.compatibility.propertyPreferences.map((pref: string, i: number) => (
                        <Badge key={i} variant="secondary" className="capitalize">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="pt-4">
                      <h4 className="text-sm text-muted-foreground mb-2">Community Preferences</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.compatibility.communityPreferences.map((pref: string, i: number) => (
                          <Badge key={i} variant="outline" className="capitalize">
                            {pref}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <h3 className="font-semibold">Deal Breakers</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.compatibility.dealBreakers.map((issue: string, i: number) => (
                        <Badge key={i} variant="destructive" className="capitalize">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start border-t pt-5">
                <h3 className="font-semibold mb-2">How This Helps You</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI uses your personality profile to match you with compatible properties and landlords. 
                  Properties that align with your preferences will show higher match percentages, helping you 
                  find the perfect place to call home.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

const PersonalityPage = () => {
  return (
    <AppLayout>
      <div className="container py-8">
        <PersonalityProfile />
      </div>
    </AppLayout>
  );
};

export default PersonalityPage;