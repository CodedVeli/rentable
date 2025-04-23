import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CircleCheck, 
  CircleX, 
  TrendingDown, 
  TrendingUp, 
  Circle, 
  Award,
  AlertTriangle, 
  ArrowRight, 
  BarChart3
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ScoreRecommendation = {
  type: 'high' | 'medium' | 'low';
  message: string;
  actionItems: string[];
};

type ScoreTrend = {
  trend: 'improving' | 'stable' | 'declining';
  percentChange: number;
  previousScore: number | null;
  currentScore: number;
};

type ComparativeAnalysis = {
  percentile: number;
  averageScore: number;
  totalScores: number;
  ranking: 'excellent' | 'good' | 'average' | 'below-average' | 'poor';
};

type TenantScore = {
  id: number;
  tenantId: number;
  landlordId: number | null;
  overallScore: number;
  paymentHistory: number;
  incomeStability: number;
  creditScore: number;
  references: number;
  rentalHistory: number;
  employmentStability: number;
  identityVerification: number;
  applicationQuality: number;
  evictionHistory: number;
  scoredAt: string;
};

type ScoreAnalysis = {
  score: TenantScore;
  recommendations: ScoreRecommendation[];
  trend: ScoreTrend;
  comparative: ComparativeAnalysis;
};

export default function TenantScoreAnalysis() {
  const { user } = useAuth();
  
  // Query to check if we need to create a default tenant score
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
  
  // Main query for tenant score analysis
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useQuery<ScoreAnalysis>({
    queryKey: ['/api/tenant-scores', user?.id, 'analysis'],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`/api/tenant-scores/${queryKey[1]}/analysis`);
      if (!res.ok) {
        // Only throw if the error isn't a 404
        if (res.status !== 404) {
          throw new Error('Failed to fetch tenant score analysis');
        }
        // For 404, we'll handle it specially to create a default score
        throw new Error('No tenant score found');
      }
      return res.json();
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handle creating a default score if one doesn't exist
  const [isCreatingScore, setIsCreatingScore] = useState(false);
  
  // If we get a 404, try to create a default score
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
          await createDefaultScore();
          // Refetch the analysis with the new score
          await refetch();
        } catch (err) {
          console.error('Failed to create default tenant score:', err);
        } finally {
          setIsCreatingScore(false);
        }
      }
    };
    
    handleMissingScore();
  }, [error, user, createDefaultScore, refetch, isCreatingScore]);
  
  if (isLoading || isCreatingScore) {
    return <ScoreAnalysisSkeleton />;
  }
  
  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tenant Score Analysis</CardTitle>
          <CardDescription>Your tenant score helps landlords assess your reliability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium">Score Not Available</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {isCreatingScore 
                ? "We're creating your tenant score now..."
                : "We couldn't fetch your tenant score analysis. Please try again later."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isCreatingScore}
          >
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const { score, recommendations, trend, comparative } = data;
  
  // Helper function to get trend icon
  const getTrendIcon = () => {
    if (trend.trend === 'improving') {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (trend.trend === 'declining') {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    } else {
      return <Circle className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  // Helper function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Helper function to get progress color
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };
  
  // Helper function to get recommendation icon
  const getRecommendationIcon = (type: 'high' | 'medium' | 'low') => {
    if (type === 'high') {
      return <CircleX className="h-5 w-5 text-red-500 flex-shrink-0" />;
    } else if (type === 'medium') {
      return <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />;
    } else {
      return <CircleCheck className="h-5 w-5 text-green-500 flex-shrink-0" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Score Analysis</CardTitle>
        <CardDescription>Insights and recommendations based on your rental profile</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="components">Score Breakdown</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-4">
              {/* Score Overview */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-32 h-32 mb-2">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreColor(score.overallScore)}`}>
                      {score.overallScore}
                    </span>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={getProgressColor(score.overallScore).replace('bg-', 'stroke-').replace('-600', '-500')}
                      strokeWidth="8"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * score.overallScore) / 100}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
                <Badge className="mb-1">
                  {comparative.ranking.charAt(0).toUpperCase() + comparative.ranking.slice(1)}
                </Badge>
                <p className="text-sm text-gray-500">
                  Better than {comparative.percentile}% of tenants
                </p>
              </div>
              
              {/* Trend Information */}
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Score Trend</h3>
                  <div className="flex items-center mt-1">
                    {getTrendIcon()}
                    <span className="ml-2">
                      {trend.trend === 'improving' ? 'Improving' : 
                       trend.trend === 'declining' ? 'Declining' : 'Stable'}
                    </span>
                    {trend.previousScore !== null && (
                      <span className="ml-2 text-sm text-gray-500">
                        {trend.percentChange > 0 ? '+' : ''}{trend.percentChange}% from previous
                      </span>
                    )}
                  </div>
                </div>
                {trend.previousScore !== null && (
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Previous</span>
                    <div className="text-lg font-medium">{trend.previousScore}</div>
                  </div>
                )}
              </div>
              
              {/* Comparative Information */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">How You Compare</h3>
                <div className="flex items-center mb-3">
                  <BarChart3 className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm">Average score: {comparative.averageScore}</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-sm">
                    Your score is {score.overallScore > comparative.averageScore ? 'above' : 'below'} average 
                    by {Math.abs(score.overallScore - comparative.averageScore)} points
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start mb-2">
                      {getRecommendationIcon(rec.type)}
                      <div className="ml-3">
                        <h3 className="font-medium">{rec.message}</h3>
                        <ul className="mt-2 text-sm space-y-1">
                          {rec.actionItems.map((item, j) => (
                            <li key={j} className="flex items-center">
                              <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <CircleCheck className="h-10 w-10 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-medium">Great Job!</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    You're doing well. We don't have any specific recommendations at this time.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="components">
            <Accordion type="single" collapsible className="w-full">
              {[
                { name: 'Payment History', value: score.paymentHistory },
                { name: 'Income Stability', value: score.incomeStability },
                { name: 'Credit Score', value: score.creditScore },
                { name: 'References', value: score.references },
                { name: 'Rental History', value: score.rentalHistory },
                { name: 'Employment Stability', value: score.employmentStability },
                { name: 'Identity Verification', value: score.identityVerification },
                { name: 'Application Quality', value: score.applicationQuality },
                { name: 'Eviction History', value: score.evictionHistory }
              ].map((component, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="py-3">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span>{component.name}</span>
                      <span className={`${getScoreColor(component.value)}`}>
                        {component.value}/100
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="py-2">
                      <Progress
                        value={component.value}
                        className={`h-2 ${getProgressColor(component.value)}`}
                      />
                      <p className="text-sm mt-2">
                        {getComponentDescription(component.name, component.value)}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/tenant/score">
          <Button variant="outline" size="sm">
            View Detailed Analysis
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Helper function to get descriptions for score components
function getComponentDescription(name: string, value: number): string {
  if (value >= 80) {
    switch (name) {
      case 'Payment History': return 'Excellent payment history with consistent on-time payments.';
      case 'Income Stability': return 'Very stable income sources with good income-to-rent ratio.';
      case 'Credit Score': return 'Excellent credit history demonstrating financial responsibility.';
      case 'References': return 'Excellent references from previous landlords and personal connections.';
      case 'Rental History': return 'Strong rental history with positive landlord experiences.';
      case 'Employment Stability': return 'Long-term stable employment in your field.';
      case 'Identity Verification': return 'Successfully completed identity verification.';
      case 'Application Quality': return 'Complete and detailed application with all supporting documents.';
      case 'Eviction History': return 'No history of evictions or lease violations.';
      default: return 'Excellent performance in this category.';
    }
  } else if (value >= 60) {
    switch (name) {
      case 'Payment History': return 'Good payment history with occasional late payments.';
      case 'Income Stability': return 'Relatively stable income with acceptable income-to-rent ratio.';
      case 'Credit Score': return 'Good credit history with some minor issues.';
      case 'References': return 'Good references with some positive feedback.';
      case 'Rental History': return 'Satisfactory rental history with minor issues.';
      case 'Employment Stability': return 'Good employment history with few job changes.';
      case 'Identity Verification': return 'Basic identity verification completed.';
      case 'Application Quality': return 'Good application with most required documents.';
      case 'Eviction History': return 'No recent evictions or major lease violations.';
      default: return 'Good performance in this category.';
    }
  } else {
    switch (name) {
      case 'Payment History': return 'History of late or missed payments. Consider setting up automatic payments.';
      case 'Income Stability': return 'Unstable income or insufficient income-to-rent ratio.';
      case 'Credit Score': return 'Poor credit history affecting your tenant score.';
      case 'References': return 'Limited or problematic references from previous landlords.';
      case 'Rental History': return 'Limited rental history or documented issues with previous rentals.';
      case 'Employment Stability': return 'Frequent job changes or gaps in employment.';
      case 'Identity Verification': return 'Incomplete identity verification. Please complete this process.';
      case 'Application Quality': return 'Incomplete application or missing important documents.';
      case 'Eviction History': return 'History of evictions or serious lease violations.';
      default: return 'This area needs improvement to increase your overall score.';
    }
  }
}

// Skeleton loader for the tenant score analysis
function ScoreAnalysisSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Score Analysis</CardTitle>
        <CardDescription>Insights and recommendations based on your rental profile</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center mb-6">
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="w-24 h-6 mt-3" />
          <Skeleton className="w-48 h-4 mt-2" />
        </div>
        
        <Skeleton className="w-full h-12 mb-6" />
        
        <Skeleton className="w-full h-24 mb-4" />
        <Skeleton className="w-full h-24 mb-4" />
        <Skeleton className="w-full h-24" />
      </CardContent>
      <CardFooter className="flex justify-center">
        <Skeleton className="w-36 h-8" />
      </CardFooter>
    </Card>
  );
}