import React from "react";
import { Link } from "wouter";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useScoreImprovements, ScoreAnalysis } from "@/hooks/use-score-improvements";

import {
  ArrowUp,
  BadgeCheck,
  Calendar,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  CreditCard,
  Home,
  LifeBuoy,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ImproveScore() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { 
    scoreAnalysisData,
    scoreAnalysisLoading,
    scoreAnalysisError,
    activeTab,
    setActiveTab
  } = useScoreImprovements(user?.id);

  // Fallback data for development or if API fails
  const demoScoreAnalysis: ScoreAnalysis = {
    score: {
      overall: 72,
      paymentHistory: 85,
      incomeStability: 65,
      creditScore: 70,
      rentalHistory: 68,
    },
    recommendations: [
      {
        type: "high",
        message: "Improve your payment history",
        actionItems: [
          "Set up automatic payments for your rent to avoid late payments",
          "Ensure sufficient funds are available in your account on your rent due date",
          "Consider paying rent a few days early each month",
        ],
        impact: 85,
      },
      {
        type: "medium",
        message: "Verify your income sources",
        actionItems: [
          "Upload recent pay stubs or income statements",
          "Provide a letter of employment verification",
          "Link your bank account for automatic verification",
        ],
        impact: 70,
      },
      {
        type: "medium",
        message: "Complete your rental profile",
        actionItems: [
          "Add previous landlord references",
          "Upload ID verification documents",
          "Complete all personal information fields",
        ],
        impact: 65,
      },
      {
        type: "low",
        message: "Build a positive rental history",
        actionItems: [
          "Request testimonials from previous landlords",
          "Document property maintenance you've performed",
          "Upload photos of how well you've maintained previous rentals",
        ],
        impact: 50,
      },
    ],
    improvementPlans: [
      {
        title: "Quick Score Boost",
        description: "Take immediate actions that can improve your score within 30 days",
        timeframe: "30 days",
        difficulty: "Easy",
        steps: [
          "Set up automatic rent payments",
          "Upload missing verification documents",
          "Complete your tenant profile (100%)",
          "Request a reference from a previous landlord",
        ],
        potentialIncrease: 10,
      },
      {
        title: "Intermediate Improvement",
        description: "Actions that improve your score over a few months",
        timeframe: "3 months",
        difficulty: "Medium",
        steps: [
          "Make 3 consecutive on-time rent payments",
          "Improve credit score by reducing credit utilization",
          "Complete a rental history verification",
          "Submit proof of stable employment",
        ],
        potentialIncrease: 25,
      },
      {
        title: "Long-term Excellence",
        description: "Build an excellent tenant score over time",
        timeframe: "6+ months",
        difficulty: "Comprehensive",
        steps: [
          "Build 6+ months of perfect payment history",
          "Maintain low credit utilization",
          "Complete tenant education courses",
          "Establish a positive maintenance request history",
          "Build a record of lease compliance",
        ],
        potentialIncrease: 40,
      },
    ],
    actionableItems: [
      {
        name: "Submit missing documents",
        status: "incomplete",
        priority: "high",
        impact: 5,
        description: "Upload your proof of income and ID verification",
        estimatedTime: "10 minutes",
        link: "/tenant/documents/upload",
      },
      {
        name: "Set up automatic payments",
        status: "incomplete",
        priority: "high",
        impact: 8,
        description: "Configure your payment method for automatic rent payments",
        estimatedTime: "5 minutes",
        link: "/tenant/payments/automatic",
      },
      {
        name: "Complete rental history",
        status: "incomplete",
        priority: "medium",
        impact: 7,
        description: "Add details about your previous rental properties",
        estimatedTime: "15 minutes",
        link: "/tenant/profile/rental-history",
      },
      {
        name: "Request landlord references",
        status: "incomplete",
        priority: "medium",
        impact: 6,
        description: "Ask previous landlords to provide a reference",
        estimatedTime: "5 minutes",
        link: "/tenant/references/request",
      },
      {
        name: "Check credit report",
        status: "incomplete",
        priority: "medium",
        impact: 4,
        description: "Review your credit report for errors and opportunities to improve",
        estimatedTime: "20 minutes",
        link: "/tenant/credit-check",
      },
    ],
  };

  // Make sure we have data to display by falling back to demo data
  const scoreData = scoreAnalysisData || demoScoreAnalysis;
  // Always use demo data during development to make sure the UI doesn't break
  const fallbackData = demoScoreAnalysis;
  const tenantScore = scoreData?.score?.overall || fallbackData.score.overall;

  // Determine score color based on value
  const scoreBadgeColor = tenantScore >= 80 
    ? "text-green-600" 
    : tenantScore >= 60 
      ? "text-yellow-600" 
      : "text-red-600";

  if (scoreAnalysisError) {
    toast({
      title: "Error loading score data",
      description: "There was a problem fetching your score data. Please try again later.",
      variant: "destructive",
    });
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Improve Your Tenant Score</h1>
            <p className="text-gray-500 mt-1">
              Follow these personalized recommendations to increase your score and improve your rental prospects
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <svg className="w-16 h-16" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={
                          tenantScore >= 80 ? "#10b981" : 
                          tenantScore >= 60 ? "#f59e0b" : 
                          "#ef4444"
                        }
                        strokeWidth="8"
                        strokeDasharray="251.3"
                        strokeDashoffset={(251.3 - (251.3 * tenantScore) / 100)}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                      <text
                        x="50"
                        y="55"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={`${scoreBadgeColor} font-bold text-xl`}
                      >
                        {scoreAnalysisLoading ? "--" : tenantScore}
                      </text>
                    </svg>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your current tenant score</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Your Score:</span>
              <span className={`text-xl font-bold ${scoreBadgeColor}`}>
                {tenantScore}/100
              </span>
              <span className="text-sm text-gray-500">
                {tenantScore >= 80 ? "Excellent" : 
                 tenantScore >= 70 ? "Good" : 
                 tenantScore >= 60 ? "Fair" : 
                 "Needs Improvement"}
              </span>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="recommendations" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="action-items">Action Items</TabsTrigger>
            <TabsTrigger value="improvement-plans">Improvement Plans</TabsTrigger>
          </TabsList>
          
          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Score Factors</CardTitle>
                    <CardDescription>See how different factors affect your overall score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {scoreAnalysisLoading ? (
                        <div className="space-y-4 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {[
                            { label: "Payment History", value: scoreData?.score?.paymentHistory || 0, icon: <CreditCard className="h-4 w-4" /> },
                            { label: "Income Stability", value: scoreData?.score?.incomeStability || 0, icon: <Wallet className="h-4 w-4" /> },
                            { label: "Credit Score", value: scoreData?.score?.creditScore || 0, icon: <BadgeCheck className="h-4 w-4" /> },
                            { label: "Rental History", value: scoreData?.score?.rentalHistory || 0, icon: <Home className="h-4 w-4" /> }
                          ].map((item, index) => (
                            <div key={index}>
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center">
                                  <span className="mr-2 text-gray-600">{item.icon}</span>
                                  <span className="font-medium">{item.label}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className={
                                    item.value >= 80 ? "text-green-600" : 
                                    item.value >= 60 ? "text-yellow-600" : 
                                    "text-red-600"
                                  }>
                                    {item.value}/100
                                  </span>
                                </div>
                              </div>
                              <Progress 
                                value={item.value} 
                                className={`h-2 ${
                                  item.value >= 80 ? "bg-green-600" : 
                                  item.value >= 60 ? "bg-yellow-600" : 
                                  "bg-red-600"
                                }`} 
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {item.value >= 80 ? "Excellent. Keep it up!" : 
                                 item.value >= 60 ? "Good, but can be improved." : 
                                 "Needs improvement. Focus on this area."}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations to Improve Your Score</CardTitle>
                    <CardDescription>Follow these steps to increase your tenant score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {scoreData?.recommendations?.map((rec, i) => (
                        <div key={i} className="border px-4 py-3 rounded-md hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium mb-1 flex items-center">
                              {rec.type === 'high' ? <CircleAlert className="h-4 w-4 mr-2 text-red-500" /> : 
                               rec.type === 'medium' ? <CircleAlert className="h-4 w-4 mr-2 text-yellow-500" /> : 
                               <CircleCheck className="h-4 w-4 mr-2 text-green-500" />}
                              {rec.message}
                            </h4>
                            <Badge className="bg-primary/20 border-primary/30 text-primary">
                              Impact: +{rec.impact/10} pts
                            </Badge>
                          </div>
                          <ul className="text-sm space-y-1 mt-2 pl-6 list-disc text-gray-700">
                            {rec.actionItems?.map((item, j) => (
                              <li key={j}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    <div className="flex items-start">
                      <CircleCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p>Set up automatic rent payments to build payment history</p>
                    </div>
                    <div className="flex items-start">
                      <CircleCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p>Keep your credit utilization below 30% to boost credit score</p>
                    </div>
                    <div className="flex items-start">
                      <CircleCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p>Upload income verification documents to improve stability score</p>
                    </div>
                    <div className="flex items-start">
                      <CircleCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p>Request references from previous landlords</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                      <Link href="/tenant/score">View Score Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-3">
                      Our tenant success team can help you understand your score and recommend specific actions to improve it.
                    </p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/tenant/support">
                        <LifeBuoy className="h-4 w-4 mr-2" />
                        Get Support
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Action Items Tab */}
          <TabsContent value="action-items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Priority Action Items</CardTitle>
                <CardDescription>Complete these tasks to improve your score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scoreData?.actionableItems?.map((item, i) => (
                    <div key={i} className="border px-4 py-3 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium mb-1 flex items-center">
                            {item.priority === 'high' ? 
                              <CircleAlert className="h-4 w-4 mr-2 text-red-500" /> : 
                              item.priority === 'medium' ? 
                                <CircleAlert className="h-4 w-4 mr-2 text-yellow-500" /> : 
                                <CircleCheck className="h-4 w-4 mr-2 text-green-500" />
                            }
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 ml-6">{item.description}</p>
                          <div className="flex items-center mt-2 ml-6 text-xs text-gray-500 space-x-4">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.estimatedTime}
                            </span>
                            <span className="flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Impact: +{item.impact} pts
                            </span>
                          </div>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={item.link}>
                            Complete
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  Completing all action items could increase your score by approximately 25-30 points.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Improvement Plans Tab */}
          <TabsContent value="improvement-plans" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scoreData?.improvementPlans?.map((plan, i) => (
                <Card key={i} className={i === 0 ? "border-primary/30" : ""}>
                  {i === 0 && (
                    <div className="bg-primary/20 text-primary text-xs font-medium py-1.5 text-center">
                      RECOMMENDED FOR YOU
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.title}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Timeframe:</span>
                        </div>
                        <span className="font-medium">{plan.timeframe}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <ArrowUp className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Potential Increase:</span>
                        </div>
                        <span className="font-medium text-primary">+{plan.potentialIncrease} pts</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Difficulty:</span>
                        </div>
                        <span className="font-medium">{plan.difficulty}</span>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Required Steps:</h4>
                        <ul className="space-y-2">
                          {plan.steps?.map((step, j) => (
                            <li key={j} className="flex items-start text-sm">
                              <CircleCheck className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant={i === 0 ? "default" : "outline"}>
                      {i === 0 ? "Start This Plan" : "View Details"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Track Your Improvement Progress</CardTitle>
                <CardDescription>
                  See how your score has changed over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center p-8">
                  <TrendingUp className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">Progress Tracking Coming Soon</h3>
                  <p className="text-gray-500 max-w-md mt-2">
                    We're building a score tracking dashboard to help you visualize your improvement over time.
                    Check back soon!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}