import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { StripeCheckoutButton } from "@/components/ui/stripe-checkout-button";
import { ClerkUserProfileButton } from "@/components/auth/ClerkUserProfileButton";
import {
  Building,
  Home,
  Shield,
  Cog,
  MessageSquare,
  CreditCard,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

export default function HomePage() {
  const { userId } = useAuth();

  return (
    <div className="bg-softwhite min-h-screen text-midnight font-sans">
      <header className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Home className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold text-xl">Rentr</span>
          </div>

          <div className="flex items-center gap-4">
            {userId ? (
              <ClerkUserProfileButton />
            ) : (
              <>
                <Link href="/auth?tab=login">
                  <Button variant="outline" size="sm">Log in</Button>
                </Link>
                <Link href="/auth?tab=register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-3 py-1 mb-6 bg-blue-100 text-blue-700 rounded-full text-sm font-medium tracking-wide">
              Trusted by 1000+ Ontario property managers
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 leading-tight tracking-tight">
              The Complete Rental Management Solution for Ontario
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Streamline your rental experience with a platform designed specifically for Ontario landlords and tenants.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link href="/auth?tab=register&role=landlord">
                <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 font-medium rounded-xl">
                  I'm a Landlord
                </Button>
              </Link>
              <Link href="/auth?tab=register&role=tenant">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg border-2 rounded-xl hover:bg-blue-50 transition-all duration-300 font-medium">
                  I'm a Tenant
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-8 text-gray-500 text-sm">
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                <span>Free basic plan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All-in-One Platform</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to manage the entire leasing process, all in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-lg mb-4 flex items-center justify-center">
                <Building className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Property Management</h3>
              <p className="text-gray-600">List and manage all your properties, track maintenance requests, and monitor occupancy.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-lg mb-4 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Identity Verification</h3>
              <p className="text-gray-600">Secure identity verification system for both landlords and tenants ensures peace of mind.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-lg mb-4 flex items-center justify-center">
                <Cog className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tenant Screening</h3>
              <p className="text-gray-600">Comprehensive tenant screening with credit checks, income verification, and reference checks.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-lg mb-4 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Digital Leases</h3>
              <p className="text-gray-600">Ontario-compliant digital lease agreements with electronic signatures and secure storage.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-lg mb-4 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Payment Processing</h3>
              <p className="text-gray-600">Simple and secure rent payments with automatic reminders and transaction history.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-lg mb-4 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">In-App Messaging</h3>
              <p className="text-gray-600">Direct communication between landlords and tenants, with history and notifications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to simplify your rental experience?</h2>
            <p className="text-xl mb-8 opacity-90">Join thousands of landlords and tenants using Rentr to save time and reduce stress.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth?tab=register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Get Started Today
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Home className="h-6 w-6 text-white mr-2" />
                <span className="font-semibold text-xl text-white">Rentr</span>
              </div>
              <p className="mb-4">The complete rental management solution for Ontario landlords and tenants.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sign Up</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Log In</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Lease Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ontario Rental Laws</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms & Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p>© {new Date().getFullYear()} Rentr Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
