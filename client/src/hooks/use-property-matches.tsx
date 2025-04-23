import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface PropertyMatchBreakdown {
  priceMatch: number;
  locationMatch: number;
  amenitiesMatch: number;
  sizeMatch: number;
  availabilityMatch: number;
}

export interface PropertyMatch {
  propertyId: number;
  matchPercentage: number;
  matchBreakdown: PropertyMatchBreakdown;
  explanation: string[];
}

interface PropertyMatchesResponse {
  matches: PropertyMatch[];
  message: string;
}

export function usePropertyMatches() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreatingScore, setIsCreatingScore] = useState(false);

  // Mutation to create a default tenant score if needed
  const { mutateAsync: createDefaultScore } = useMutation({
    mutationKey: ['createDefaultTenantScore'],
    mutationFn: async () => {
      const response = await fetch('/api/tenant-scores/me/default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create default tenant score');
      }
      
      return response.json();
    }
  });

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<PropertyMatchesResponse>({
    queryKey: ['/api/tenant-scores', user?.id, 'property-matches'],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      const res = await fetch(`/api/tenant-scores/${user.id}/property-matches`);
      if (!res.ok) {
        // If we get a 404, the tenant score might be missing
        if (res.status === 404) {
          throw new Error("No tenant score found");
        }
        throw new Error("Failed to load property matches");
      }
      
      return res.json();
    },
    enabled: !!user && user.role === 'tenant',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Handle missing tenant score
  useEffect(() => {
    const handleMissingScore = async () => {
      // Make sure we're authenticated as a tenant
      if (!user || user.role !== 'tenant' || isCreatingScore) {
        return;
      }
      
      // Check if the error is due to missing tenant score
      if (error && error.message.includes('No tenant score found')) {
        try {
          setIsCreatingScore(true);
          toast({
            title: "Creating your tenant score",
            description: "We're generating your tenant score to help you find matching properties.",
          });
          
          await createDefaultScore();
          
          // Refetch property matches
          await refetch();
          
          toast({
            title: "Tenant score created",
            description: "Your tenant score has been created successfully.",
          });
        } catch (err) {
          console.error("Failed to create default tenant score:", err);
          toast({
            title: "Failed to create tenant score",
            description: "There was a problem creating your tenant score. Please try again later.",
            variant: "destructive",
          });
        } finally {
          setIsCreatingScore(false);
        }
      }
    };
    
    handleMissingScore();
  }, [error, user, createDefaultScore, refetch, isCreatingScore, toast]);

  // Handle other errors with useEffect
  useEffect(() => {
    if (error && !error.message.includes('No tenant score found') && !isCreatingScore) {
      toast({
        title: "Failed to load property matches",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast, isCreatingScore]);

  return {
    propertyMatches: data?.matches || [],
    message: data?.message || (isCreatingScore ? "Creating your tenant score..." : "Loading your property matches..."),
    isLoading: isLoading || isCreatingScore,
    error,
    refetch,
    isCreatingScore
  };
}

export default usePropertyMatches;