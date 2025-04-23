import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, UserCog, Home, Users, AlertCircle, CheckCircle, 
  ArrowRight, Building, Handshake, AlertTriangle 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/app-layout";
import { useLocation } from "wouter";

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

const MatchScore = ({ score, label }: { score: number; label: string }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-medium">{score}%</span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  );
};

const TenantPersonalityPage = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Get tenants for this landlord
  const { 
    data: tenants,
    isLoading: isTenantsLoading
  } = useQuery({
    queryKey: ['/api/users/tenants'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users/tenants');
      if (!res.ok) throw new Error('Failed to fetch tenants');
      return await res.json();
    }
  });
  
  // Get properties for this landlord
  const {
    data: properties,
    isLoading: isPropertiesLoading
  } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/properties');
      if (!res.ok) throw new Error('Failed to fetch properties');
      return await res.json();
    }
  });
  
  // Fetch tenant personality profile
  const { 
    data: profileData, 
    isLoading: isProfileLoading
  } = useQuery({
    queryKey: ['/api/personality-match/tenant-profile', selectedTenant],
    queryFn: async () => {
      if (!selectedTenant) return null;
      const res = await apiRequest('GET', `/api/personality-match/tenant-profile/${selectedTenant}`);
      if (!res.ok) throw new Error('Failed to fetch personality profile');
      return await res.json();
    },
    enabled: !!selectedTenant
  });
  
  // Fetch property compatibility
  const {
    data: propertyCompatibility,
    isLoading: isCompatibilityLoading
  } = useQuery({
    queryKey: ['/api/personality-match/property-compatibility', selectedTenant, selectedProperty],
    queryFn: async () => {
      if (!selectedTenant || !selectedProperty) return null;
      
      const existingCompatibility = await apiRequest('GET', 
        `/api/personality-match/property-compatibility/${selectedTenant}/${selectedProperty}`
      ).then(res => res.ok ? res.json() : null);
      
      if (existingCompatibility) return existingCompatibility;
      
      // If no existing compatibility, compute it
      const res = await apiRequest('POST', '/api/personality-match/property-compatibility', {
        tenantId: parseInt(selectedTenant),
        propertyId: parseInt(selectedProperty)
      });
      
      if (!res.ok) throw new Error('Failed to analyze property compatibility');
      return await res.json();
    },
    enabled: !!selectedTenant && !!selectedProperty
  });
  
  // Analyze landlord compatibility mutation
  const landlordCompatibilityMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTenant) throw new Error('No tenant selected');
      
      const userId = localStorage.getItem('userId');
      
      const res = await apiRequest('POST', '/api/personality-match/landlord-compatibility', {
        tenantId: parseInt(selectedTenant),
        landlordId: parseInt(userId || '0')
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to analyze landlord compatibility');
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Compatibility Analyzed",
        description: "Landlord-tenant compatibility analysis completed.",
        variant: "default",
      });
      
      queryClient.setQueryData(
        ['/api/personality-match/landlord-compatibility', selectedTenant], 
        data
      );
      
      setActiveTab('landlord');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze compatibility.",
        variant: "destructive",
      });
    }
  });
  
  // Fetch landlord compatibility
  const {
    data: landlordCompatibility,
    isLoading: isLandlordCompatLoading
  } = useQuery({
    queryKey: ['/api/personality-match/landlord-compatibility', selectedTenant],
    queryFn: async () => {
      if (!selectedTenant) return null;
      
      const userId = localStorage.getItem('userId');
      
      const res = await apiRequest('GET', 
        `/api/personality-match/landlord-compatibility/${selectedTenant}/${userId}`
      );
      
      if (!res.ok) return null;
      return await res.json();
    },
    enabled: !!selectedTenant
  });
  
  const handleAnalyzeLandlordCompatibility = () => {
    landlordCompatibilityMutation.mutate();
  };
  
  const profile = profileData?.profile;
  const hasProfile = !!profile;
  const hasPropertyCompatibility = !!propertyCompatibility?.compatibility;
  const hasLandlordCompatibility = !!landlordCompatibility?.compatibility;
  
  const propertyComp = propertyCompatibility?.compatibility;
  const landlordComp = landlordCompatibility?.compatibility;
  
  if (isTenantsLoading || isPropertiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-6">Tenant Personality Analysis</h1>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Tenant</CardTitle>
              <CardDescription>
                Choose a tenant to view their personality profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTenant || ""} onValueChange={setSelectedTenant}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants?.map((tenant: any) => (
                    <SelectItem key={tenant.id} value={tenant.id.toString()}>
                      {tenant.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Property</CardTitle>
              <CardDescription>
                Choose a property to analyze compatibility with the selected tenant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedProperty || ""} 
                onValueChange={setSelectedProperty}
                disabled={!selectedTenant}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map((property: any) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.addressStreet}, {property.addressCity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {selectedTenant && !hasProfile && !isProfileLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <UserCog className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">No Personality Profile</h3>
              <p className="text-center text-muted-foreground max-w-md">
                This tenant doesn't have a personality profile yet. They need to generate one from their dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isProfileLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      
      {hasProfile && (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="profile">Personality Traits</TabsTrigger>
            <TabsTrigger value="property" disabled={!selectedProperty}>Property Match</TabsTrigger>
            <TabsTrigger value="landlord">Landlord Compatibility</TabsTrigger>
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
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Communication & Expectations</h3>
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
                    
                    <div>
                      <h3 className="font-semibold mb-3">Lifestyle</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          {profile.lifestyle.workFromHome ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">Works from home</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize text-xs">
                            {profile.lifestyle.typicalSchedule.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm">Schedule</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize text-xs">
                            {profile.lifestyle.guestsFrequency}
                          </Badge>
                          <span className="text-sm">Has guests</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {profile.lifestyle.petOwner ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">{profile.lifestyle.petOwner ? 'Has pets' : 'No pets'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {profile.lifestyle.smoker ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">{profile.lifestyle.smoker ? 'Smoker' : 'Non-smoker'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Compatibility Preferences</CardTitle>
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
            </Card>
          </TabsContent>
          
          <TabsContent value="property" className="space-y-6">
            {isCompatibilityLoading && (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            
            {hasPropertyCompatibility && propertyComp && (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Property Compatibility</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">{propertyComp.overallScore}%</span>
                        <Badge variant={
                          propertyComp.overallScore >= 80 ? "default" : 
                          propertyComp.overallScore >= 60 ? "secondary" : 
                          "outline"
                        }>
                          {propertyComp.overallScore >= 80 ? "High Match" : 
                           propertyComp.overallScore >= 60 ? "Moderate Match" : 
                           "Low Match"}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      {propertyComp.personalityInsights}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground">MATCH BREAKDOWN</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <MatchScore score={propertyComp.matchDetails.locationMatch} label="Location" />
                          <MatchScore score={propertyComp.matchDetails.amenitiesMatch} label="Amenities" />
                          <MatchScore score={propertyComp.matchDetails.lifestyleMatch} label="Lifestyle Fit" />
                          <MatchScore score={propertyComp.matchDetails.maintenanceMatch} label="Maintenance Expectations" />
                          <MatchScore score={propertyComp.matchDetails.financialMatch} label="Financial Compatibility" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-primary mr-2" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 list-disc pl-5">
                        {propertyComp.strengthsWeaknesses.strengths.map((strength: string, i: number) => (
                          <li key={i}>{strength}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                        Weaknesses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 list-disc pl-5">
                        {propertyComp.strengthsWeaknesses.weaknesses.map((weakness: string, i: number) => (
                          <li key={i}>{weakness}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations & Challenges</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-3 text-sm text-muted-foreground">FOR LANDLORD</h3>
                      <ul className="space-y-3 list-disc pl-5">
                        {propertyComp.recommendationsForLandlord.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3 text-sm text-muted-foreground">POTENTIAL CHALLENGES</h3>
                      <ul className="space-y-3 list-disc pl-5">
                        {propertyComp.potentialChallenges.map((challenge: string, i: number) => (
                          <li key={i}>{challenge}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="landlord" className="space-y-6">
            {!hasLandlordCompatibility && !landlordCompatibilityMutation.isPending && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Handshake className="h-16 w-16 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">No Compatibility Analysis</h3>
                    <p className="text-center text-muted-foreground max-w-md">
                      Analyze your compatibility with this tenant to see how well your management style matches their expectations.
                    </p>
                    <Button onClick={handleAnalyzeLandlordCompatibility} disabled={!selectedTenant}>
                      Generate Compatibility Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {(isLandlordCompatLoading || landlordCompatibilityMutation.isPending) && (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            
            {hasLandlordCompatibility && landlordComp && (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Landlord-Tenant Compatibility</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">{landlordComp.overallScore}%</span>
                        <Badge variant={
                          landlordComp.overallScore >= 80 ? "default" : 
                          landlordComp.overallScore >= 60 ? "secondary" : 
                          "outline"
                        }>
                          {landlordComp.overallScore >= 80 ? "High Match" : 
                           landlordComp.overallScore >= 60 ? "Moderate Match" : 
                           "Low Match"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground">MATCH BREAKDOWN</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <MatchScore 
                            score={landlordComp.matchDetails.communicationMatch} 
                            label="Communication Style" 
                          />
                          <MatchScore 
                            score={landlordComp.matchDetails.expectationsMatch} 
                            label="Expectations Alignment" 
                          />
                          <MatchScore 
                            score={landlordComp.matchDetails.managementStyleMatch} 
                            label="Management Style Fit" 
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-primary mr-2" />
                        Relationship Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 list-disc pl-5">
                        {landlordComp.strengths.map((strength: string, i: number) => (
                          <li key={i}>{strength}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                        Potential Conflicts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 list-disc pl-5">
                        {landlordComp.potentialConflicts.map((conflict: string, i: number) => (
                          <li key={i}>{conflict}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations for Success</CardTitle>
                    <CardDescription>
                      Follow these recommendations to build a successful landlord-tenant relationship
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 list-disc pl-5">
                      {landlordComp.recommendationsForSuccess.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

const LandlordTenantPersonalityPage = () => {
  return (
    <AppLayout>
      <div className="container py-8">
        <TenantPersonalityPage />
      </div>
    </AppLayout>
  );
};

export default LandlordTenantPersonalityPage;