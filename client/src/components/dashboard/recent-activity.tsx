import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Clock, 
  Home, 
  DollarSign, 
  FileText, 
  CalendarDays, 
  FileCheck, 
  MessageSquare 
} from "lucide-react";

export interface Activity {
  id: number | string;
  type: string;
  title: string;
  timestamp?: Date;
  date?: Date;
  link: string;
  status?: string;
}

export interface RecentActivityProps {
  activities?: Activity[];
}

export default function RecentActivity({ activities = [] }: RecentActivityProps) {
  const formatRelativeTime = (dateInput?: Date) => {
    if (!dateInput) {
      return '';
    }
    
    const date = new Date(dateInput);
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
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <Home className="h-5 w-5 text-primary-500" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-success-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-warning-500" />;
      case 'viewing':
        return <CalendarDays className="h-5 w-5 text-sky-500" />;
      case 'lease':
        return <FileCheck className="h-5 w-5 text-purple-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-indigo-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getActivityStatusColor = (status?: string) => {
    if (!status) return "text-gray-600";
    
    switch (status.toLowerCase()) {
      case 'success':
      case 'paid':
      case 'approved':
      case 'active':
        return "text-success-600";
      case 'pending':
      case 'waiting':
        return "text-warning-600";
      case 'rejected':
      case 'canceled':
      case 'failed':
        return "text-destructive-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="bg-gray-100 rounded-full p-2 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={activity.link}>
                    <div className="font-medium text-sm text-gray-900 hover:text-primary-600 cursor-pointer">
                      {activity.title}
                    </div>
                  </Link>
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(activity.timestamp || activity.date || new Date())}
                    </p>
                    {activity.status && (
                      <>
                        <span className="mx-1.5 h-1 w-1 rounded-full bg-gray-300"></span>
                        <p className={`text-xs font-medium capitalize ${getActivityStatusColor(activity.status)}`}>
                          {activity.status}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}