import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Home, Shield, FileText, CreditCard, Building, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header - Clean, minimal like Plaid */}
      <header className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Home className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold text-xl">Rentr Docs</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">Rentr.com</div>
            <Link href="/auth?tab=login">
              <Button variant="outline" size="sm">Log in</Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button size="sm">Get API Keys</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main>
        {/* Hero Section - Inspired by Plaid's clean layout */}
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Welcome to the Docs
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Here you'll find guides, resources, and references to build with Rentr. The simplest way to manage rentals in Ontario.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/auth?tab=register">
                <Button className="w-full sm:w-auto">
                  Get started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth?tab=login">
                <Button variant="outline" className="w-full sm:w-auto">
                  View reference
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="relative max-w-md mx-auto">
              <div className="bg-slate-100 rounded-xl p-6 md:p-8">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80" 
                  alt="Ontario apartment building" 
                  className="rounded-lg w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick access cards - Similar to Plaid's three-column layout */}
        <div className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <Building className="h-5 w-5 text-primary mr-2" />
                    <CardTitle className="text-xl">Quickstart</CardTitle>
                  </div>
                  <CardDescription>
                    Learn about Rentr's key concepts and run starter code
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/auth?tab=register">
                    <Button variant="outline" className="w-full">
                      Get started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-primary mr-2" />
                    <CardTitle className="text-xl">API Reference</CardTitle>
                  </div>
                  <CardDescription>
                    Explore server-side API libraries and integrate with Rentr endpoints
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/auth?tab=login">
                    <Button variant="outline" className="w-full">
                      View reference <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-primary mr-2" />
                    <CardTitle className="text-xl">Link</CardTitle>
                  </div>
                  <CardDescription>
                    Link's client-side component, helps your users connect their accounts
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/auth?tab=login">
                    <Button variant="outline" className="w-full">
                      Build with Link <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Products Section - Borrowing from Plaid's organization */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-10">Rentals and Management</h2>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Tenant Screening</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Our comprehensive tenant screening includes credit checks, background verification, and tenant scoring.
                </p>
              </CardContent>
              <CardFooter className="pt-0 flex items-center text-sm text-primary">
                <Shield className="h-4 w-4 mr-1" />
                <span>Identity Verification</span>
              </CardFooter>
            </Card>
            
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Digital Leases</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Create, sign, and manage Ontario-compliant lease agreements with secure digital signatures.
                </p>
              </CardContent>
              <CardFooter className="pt-0 flex items-center text-sm text-primary">
                <FileText className="h-4 w-4 mr-1" />
                <span>Document Management</span>
              </CardFooter>
            </Card>
            
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Process rent payments securely with automatic receipts and flexible payment options.
                </p>
              </CardContent>
              <CardFooter className="pt-0 flex items-center text-sm text-primary">
                <CreditCard className="h-4 w-4 mr-1" />
                <span>Payment Processing</span>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Simple footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Rentr. All rights reserved.
        </div>
      </footer>
    </div>
  );
}