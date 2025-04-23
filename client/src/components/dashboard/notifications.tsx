import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  FileText, 
  Home,
  Info 
} from "lucide-react";

export interface Notification {
  id: number;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type: string;
}

export interface NotificationsProps {
  notifications?: Notification[];
}

// Demo notifications for testing
const demoNotifications: Notification[] = [
  {
    id: 1,
    title: "Payment received",
    message: "The rent payment for May has been processed successfully",
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    read: false,
    type: "payment"
  },
  {
    id: 2,
    title: "Viewing scheduled",
    message: "A viewing has been scheduled for 123 Main St on Friday at 2pm",
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
    read: true,
    type: "viewing"
  },
  {
    id: 3,
    title: "Maintenance request",
    message: "There is a new maintenance request for 456 Elm St",
    date: new Date(new Date().setDate(new Date().getDate() - 3)),
    read: false,
    type: "maintenance"
  },
  {
    id: 4,
    title: "Lease expiring soon",
    message: "Your lease for 123 Main St is expiring in 30 days",
    date: new Date(new Date().setDate(new Date().getDate() - 5)),
    read: true,
    type: "lease"
  }
];

export default function Notifications({ notifications = demoNotifications }: NotificationsProps) {
  
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-CA', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getLinkPath = (notification: Notification) => {
    switch (notification.type) {
      case 'payment':
        return '/payments';
      case 'viewing':
        return '/viewings';
      case 'maintenance':
        return '/maintenance';
      case 'lease':
        return '/leases';
      default:
        return '/notifications';
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="h-5 w-5 text-success-500" />;
      case 'viewing':
        return <Calendar className="h-5 w-5 text-sky-500" />;
      case 'maintenance':
        return <AlertCircle className="h-5 w-5 text-warning-500" />;
      case 'lease':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'property':
        return <Home className="h-5 w-5 text-primary-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium text-gray-900">Notifications</CardTitle>
          {unreadCount > 0 && (
            <div className="bg-primary-100 text-primary-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {unreadCount} new
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2 pt-0">
        {notifications.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notification) => (
              <div 
                key={notification.id} 
                className={`flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0 ${!notification.read ? 'bg-gray-50 -mx-4 px-4' : ''}`}
              >
                <div className={`rounded-full p-2 ${!notification.read ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={getLinkPath(notification)}>
                    <div className={`font-medium text-sm cursor-pointer hover:text-primary-600 ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </div>
                  </Link>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                    {notification.message}
                  </p>
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(notification.date)}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" size="sm" className="w-full text-xs text-primary-600 font-medium">
            <Link href="/notifications">
              View all notifications
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}