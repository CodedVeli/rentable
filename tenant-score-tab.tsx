import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import TenantScoreAnalysis from "@/components/dashboard/tenant-score-analysis";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { History, FileCheck } from "lucide-react";

export default function TenantScoreTab() {
  return (
    <TabsContent value="rental-score" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <TenantScoreAnalysis />
        </div>
        
        <div className="space-y-4">
          {/* Right column content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Action Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/tenant/score-history">
                    <History className="h-4 w-4 mr-2" />
                    View Score History
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/tenant/credit-check">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Get Credit Report
                  </Link>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button className="w-full" asChild>
                <Link href="/tenant/score-improvement">
                  Improve My Score
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
}