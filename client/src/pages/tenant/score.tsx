import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import TenantScoreAnalysis from "@/components/dashboard/tenant-score-analysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function TenantScorePage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tenant Score</h1>
          <p className="text-gray-600 mt-1">
            Understand your tenant score and how to improve it
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <TenantScoreAnalysis />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Tenant Scores</CardTitle>
                <CardDescription>How our tenant scoring system works</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Our tenant scoring system evaluates your rental profile based on multiple factors to 
                  help landlords assess your reliability as a tenant.
                </p>
                
                <h3 className="font-medium text-sm">Scoring Factors:</h3>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  <li>Payment history</li>
                  <li>Income stability</li>
                  <li>Credit score</li>
                  <li>References</li>
                  <li>Rental history</li>
                  <li>Employment stability</li>
                  <li>Identity verification</li>
                  <li>Application quality</li>
                  <li>Eviction history</li>
                </ul>
                
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Score Privacy</AlertTitle>
                  <AlertDescription>
                    Your score is only visible to you and landlords you apply to rent from.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Improving Your Score</CardTitle>
                <CardDescription>General tips to boost your tenant score</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2.5">
                  <li>
                    <strong>Pay rent on time:</strong> Set up automatic payments to ensure you never miss a deadline.
                  </li>
                  <li>
                    <strong>Build credit:</strong> Pay your bills on time and maintain a good credit score.
                  </li>
                  <li>
                    <strong>Maintain stable employment:</strong> Long-term employment demonstrates stability.
                  </li>
                  <li>
                    <strong>Keep good relationships:</strong> Maintain positive relationships with previous landlords.
                  </li>
                  <li>
                    <strong>Complete verification:</strong> Fully verify your identity through our platform.
                  </li>
                  <li>
                    <strong>Submit complete applications:</strong> Provide all requested documents and information.
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