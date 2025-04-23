import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import { AuthProvider } from "./hooks/use-auth";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import MessagesPage from "@/pages/messages";
import DocumentsPage from "@/pages/documents";
import ProfilePage from "@/pages/profile";
import SecurityPage from "@/pages/security";
import Onboard from "@/pages/onboard";
import AuthRedirect from "@/pages/auth-redirect";

// Lazy loading components for landlord routes
const LandlordDashboardLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/landlord/dashboard'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading landlord dashboard...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const LandlordPropertiesLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/landlord/properties'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading properties...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const LandlordTenantsLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/landlord/tenants'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading tenants...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const LandlordLeasesLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/landlord/leases'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading leases...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const LandlordPaymentsLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/landlord/payments'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading payments...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const LandlordViewingsLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/landlord/viewings'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading viewings...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const LandlordNewPropertyLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/landlord/new-property'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading property form...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const LandlordPropertyDetailsLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/landlord/property-details'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading detailed property form...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const LandlordApplicationsLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/landlord/applications'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading applications...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

// Lazy loading components for tenant routes
const TenantDashboardLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/tenant/dashboard'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading tenant dashboard...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const TenantPropertiesLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/tenant/properties'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading properties...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const TenantApplicationsLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/tenant/applications'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading applications...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const TenantLeasesLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/tenant/leases'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading leases...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const TenantPaymentsLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/tenant/payments'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading payments...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const TenantViewingsLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/tenant/viewings'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading viewings...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const TenantScoreLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/tenant/score'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading tenant score...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

const TenantImproveScoreLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/tenant/score/improve'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading score improvement...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};



const TenantSecurityLazy = () => {
  const LazyComponent = React.lazy(() => import('@/pages/tenant/security'));
  return (
    <React.Suspense fallback={<div className="p-8 text-center">Loading security settings...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth-redirect" component={AuthRedirect} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/security" component={SecurityPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/documents" component={DocumentsPage} />
      <Route path="/onboard" component={Onboard} />

      {/* Landlord routes */}
      <Route path="/landlord/dashboard" component={LandlordDashboardLazy} />
      <Route path="/landlord/properties" component={LandlordPropertiesLazy} />
      <Route path="/landlord/new-property" component={LandlordNewPropertyLazy} />
      <Route path="/landlord/property-details" component={LandlordPropertyDetailsLazy} />
      <Route path="/landlord/tenants" component={LandlordTenantsLazy} />
      <Route path="/landlord/leases" component={LandlordLeasesLazy} />
      <Route path="/landlord/payments" component={LandlordPaymentsLazy} />
      <Route path="/landlord/viewings" component={LandlordViewingsLazy} />
      <Route path="/landlord/applications" component={LandlordApplicationsLazy} />

      {/* Tenant routes */}
      <Route path="/tenant/dashboard" component={TenantDashboardLazy} />
      <Route path="/tenant/properties" component={TenantPropertiesLazy} />
      <Route path="/tenant/applications" component={TenantApplicationsLazy} />
      <Route path="/tenant/leases" component={TenantLeasesLazy} />
      <Route path="/tenant/payments" component={TenantPaymentsLazy} />
      <Route path="/tenant/viewings" component={TenantViewingsLazy} />
      <Route path="/tenant/score" component={TenantScoreLazy} />
      <Route path="/tenant/score/improve" component={TenantImproveScoreLazy} />
      <Route path="/tenant/security" component={TenantSecurityLazy} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
