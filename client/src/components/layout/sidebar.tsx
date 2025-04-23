import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ClerkSignOutButton } from "@/components/auth/ClerkSignOutButton";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Building,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  X,
  User,
  Key,
  Search,
  ClipboardCheck,
  BarChart3,
  Wallet,
  CreditCard,
  LineChart
} from "lucide-react";

interface SidebarProps {
  userRole: string;
  userName: string;
  onClose?: () => void;
}

export default function Sidebar({ userRole, userName, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  // Robust display name and role
  const displayName =
    (user && 'firstName' in user && user.firstName) ||
    (user && 'username' in user && user.username) ||
    (user && 'email' in user && typeof user.email === 'string' && user.email) ||
    userName || 'User';

  const displayRole =
    (user && 'role' in user && user.role) ||
    userRole || 'tenant';
  
  // Determine menu items based on user role
  const menuItems = userRole === 'landlord' ? [
    { 
      href: '/landlord/dashboard', 
      label: 'Dashboard', 
      icon: <Home className="h-5 w-5" /> 
    },
    { 
      href: '/landlord/properties', 
      label: 'Properties', 
      icon: <Building className="h-5 w-5" /> 
    },
    { 
      href: '/landlord/tenants', 
      label: 'Tenants', 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      href: '/landlord/leases', 
      label: 'Leases', 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      href: '/landlord/payments', 
      label: 'Payments', 
      icon: <CreditCard className="h-5 w-5" /> 
    },
    { 
      href: '/landlord/viewings', 
      label: 'Viewings', 
      icon: <Calendar className="h-5 w-5" /> 
    },
    { 
      href: '/landlord/applications', 
      label: 'Applications', 
      icon: <ClipboardCheck className="h-5 w-5" /> 
    },
  ] : [
    { 
      href: '/tenant/dashboard', 
      label: 'Dashboard', 
      icon: <Home className="h-5 w-5" /> 
    },
    { 
      href: '/tenant/properties', 
      label: 'Find Properties', 
      icon: <Search className="h-5 w-5" /> 
    },
    { 
      href: '/tenant/applications', 
      label: 'Applications', 
      icon: <ClipboardCheck className="h-5 w-5" /> 
    },
    { 
      href: '/tenant/leases', 
      label: 'My Leases', 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      href: '/tenant/payments', 
      label: 'Payments', 
      icon: <CreditCard className="h-5 w-5" /> 
    },
    { 
      href: '/tenant/viewings', 
      label: 'Viewings', 
      icon: <Calendar className="h-5 w-5" /> 
    },
    { 
      href: '/tenant/score', 
      label: 'Tenant Score', 
      icon: <BarChart3 className="h-5 w-5" /> 
    },
  ];
  
  // Common menu items for both roles
  const commonMenuItems = [
    { 
      href: '/messages', 
      label: 'Messages', 
      icon: <MessageSquare className="h-5 w-5" /> 
    },
    { 
      href: '/notifications', 
      label: 'Notifications', 
      icon: <Bell className="h-5 w-5" /> 
    },
  ];
  
  // User account menu items
  const accountMenuItems = [
    { 
      href: '/profile', 
      label: 'My Profile', 
      icon: <User className="h-5 w-5" /> 
    },
    { 
      href: '/security', 
      label: 'Security', 
      icon: <Key className="h-5 w-5" /> 
    },
    { 
      href: '/settings', 
      label: 'Settings', 
      icon: <Settings className="h-5 w-5" /> 
    },
  ];
  
  // Check if a menu item is active
  const isActive = (path: string) => {
    if (path === `/${userRole}/dashboard` && location === path) {
      return true;
    }
    return location.startsWith(path);
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4">
        <Link href={`/${userRole}/dashboard`}>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-primary-500 text-white flex items-center justify-center font-bold text-lg mr-2">
              R
            </div>
            <h1 className="text-xl font-bold text-gray-900">Rentr</h1>
          </div>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="px-4 py-2">
        <div className="bg-gray-50 rounded-lg p-3 flex items-center space-x-3">
          <Avatar>
            <AvatarImage
              src={user && 'imageUrl' in user && typeof user.imageUrl === 'string' ? user.imageUrl : undefined}
              alt={displayName}
            />
            <AvatarFallback className="bg-primary-100 text-primary-800">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 capitalize">{displayRole}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <Button
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive(item.href) ? 'bg-primary-50 text-primary-900' : ''}`}
              >
                <span className={`mr-3 ${isActive(item.href) ? 'text-primary-600' : ''}`}>
                  {item.icon}
                </span>
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-1">
          {commonMenuItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <Button
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive(item.href) ? 'bg-primary-50 text-primary-900' : ''}`}
              >
                <span className={`mr-3 ${isActive(item.href) ? 'text-primary-600' : ''}`}>
                  {item.icon}
                </span>
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-1">
          {accountMenuItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <Button
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive(item.href) ? 'bg-primary-50 text-primary-900' : ''}`}
              >
                <span className={`mr-3 ${isActive(item.href) ? 'text-primary-600' : ''}`}>
                  {item.icon}
                </span>
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <ClerkSignOutButton className="w-full justify-start text-gray-700" />
      </div>
    </div>
  );
}