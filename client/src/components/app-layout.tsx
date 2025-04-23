import React from 'react';
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Home,
  Building,
  Users,
  FileText,
  CreditCard,
  Calendar,
  MessageCircle,
  Settings,
  Menu,
  LogOut,
  Bell,
  ChevronDown,
  Search,
  PlusCircle,
  ClipboardList,
  Star,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const isLandlord = user?.role === "landlord";
  const isTenant = user?.role === "tenant";
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Navigation items based on user role
  const navigationItems = [
    ...(isLandlord ? [
      { name: "Dashboard", href: "/landlord/dashboard", icon: <Home className="h-5 w-5" /> },
      { name: "Properties", href: "/landlord/properties", icon: <Building className="h-5 w-5" /> },
      { name: "Applications", href: "/landlord/applications", icon: <ClipboardList className="h-5 w-5" /> },
      { name: "Tenants", href: "/landlord/tenants", icon: <Users className="h-5 w-5" /> },
      { name: "Leases", href: "/landlord/leases", icon: <FileText className="h-5 w-5" /> },
      { name: "Payments", href: "/landlord/payments", icon: <CreditCard className="h-5 w-5" /> },
      { name: "Viewings", href: "/landlord/viewings", icon: <Calendar className="h-5 w-5" /> },
    ] : []),
    ...(isTenant ? [
      { name: "Dashboard", href: "/tenant/dashboard", icon: <Home className="h-5 w-5" /> },
      { name: "My Rentals", href: "/tenant/rentals", icon: <Building className="h-5 w-5" /> },
      { name: "Applications", href: "/tenant/applications", icon: <ClipboardList className="h-5 w-5" /> },
      { name: "Payments", href: "/tenant/payments", icon: <CreditCard className="h-5 w-5" /> },
      { name: "Documents", href: "/tenant/documents", icon: <FileText className="h-5 w-5" /> },
      { name: "Score", href: "/tenant/score", icon: <Star className="h-5 w-5" /> },
    ] : []),
    { name: "Messages", href: "/messages", icon: <MessageCircle className="h-5 w-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
              <h1 className="text-xl font-bold text-primary">Rentr</h1>
            </div>
            <nav className="mt-5 flex-1 px-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    location === item.href
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className={`mr-3 ${location === item.href ? "text-white" : "text-gray-500 group-hover:text-gray-600"}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.firstName?.[0] || ""}
                    {user?.lastName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user?.role}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronDown className="h-4 w-4" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <Settings className="h-4 w-4 mr-2" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <SheetHeader className="px-4 py-5 border-b border-gray-200">
                  <SheetTitle className="text-center text-xl font-bold text-primary">Rentr</SheetTitle>
                </SheetHeader>
                <nav className="px-4 py-2 space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md ${
                        location === item.href
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className={`mr-3 ${location === item.href ? "text-white" : "text-gray-500 group-hover:text-gray-600"}`}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-gray-200 px-4 py-5 mt-auto">
                  <div className="flex items-center">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.firstName?.[0] || ""}
                        {user?.lastName?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="mt-4 w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-primary">Rentr</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/messages">
                <MessageCircle className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.firstName?.[0] || ""}
                {user?.lastName?.[0] || ""}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="h-16"></div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}