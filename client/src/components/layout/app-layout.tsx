import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Sidebar from './sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);
  
  // Determine if this is a landlord or tenant route
  const userRole = location.startsWith('/landlord') ? 'landlord' : 'tenant';
  
  return (
    <div className="flex h-screen bg-gray-50 dashboard-container">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar userRole={userRole} userName={user?.firstName || 'User'} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-y-auto">
        {/* Top navbar - mobile only */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="mr-2"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-medium text-gray-900">
                {userRole === 'landlord' ? 'Landlord Portal' : 'Tenant Portal'}
              </h1>
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}