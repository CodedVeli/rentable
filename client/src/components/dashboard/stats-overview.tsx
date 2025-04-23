import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Property, Payment, Lease } from "@shared/schema";
import { ArrowUpRight, ArrowDownRight, Home, CreditCard, FileText, DollarSign, ClipboardList } from "lucide-react";

export interface StatsOverviewProps {
  properties?: Property[];
  payments?: Payment[];
  leases?: Lease[];
  pendingApplications?: Array<{id: number, title: string, applicationsCount: number}>;
  userRole: "landlord" | "tenant";
}

export default function StatsOverview({ 
  properties = [], 
  payments = [], 
  leases = [],
  pendingApplications = [],
  userRole
}: StatsOverviewProps) {
  
  // Calculate stats
  const totalPropertiesCount = properties.length;
  // Check if properties have status field to avoid TypeScript errors
  const occupiedPropertiesCount = properties.filter(p => 
    // @ts-ignore - this may be a demo property with status
    (p.status === "rented" || p.status === "occupied")
  ).length;
  const occupancyRate = totalPropertiesCount > 0 
    ? Math.round(occupiedPropertiesCount / totalPropertiesCount * 100) 
    : 0;
  
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  const paidPaymentsThisMonth = payments.filter(p => 
    p.status === "paid" && new Date(p.paidDate as Date) >= startOfMonth
  );
  
  const pendingPaymentsCount = payments.filter(p => p.status === "pending").length;
  
  const totalPaidAmount = paidPaymentsThisMonth.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount / 100);
  };
  
  // Different stats based on user role
  const stats = {
    landlord: [
      {
        title: "Properties",
        value: totalPropertiesCount,
        description: `${occupancyRate}% Occupied`,
        icon: <Home className="h-5 w-5 text-primary-600" />,
        trend: {
          value: occupancyRate > 80 ? "Positive" : "Neutral",
          icon: occupancyRate > 80 ? <ArrowUpRight className="h-4 w-4 text-success-600" /> : null
        }
      },
      {
        title: "Active Leases",
        value: leases.filter(l => l.status === "active").length,
        description: `${leases.filter(l => l.status === "active").length} of ${leases.length} Total`,
        icon: <FileText className="h-5 w-5 text-warning-600" />,
        trend: {
          value: "Neutral",
          icon: null
        }
      },
      {
        title: "Revenue (Month)",
        value: formatCurrency(totalPaidAmount),
        description: `From ${paidPaymentsThisMonth.length} Payments`,
        icon: <DollarSign className="h-5 w-5 text-success-600" />,
        trend: {
          value: totalPaidAmount > 0 ? "Positive" : "Neutral",
          icon: totalPaidAmount > 0 ? <ArrowUpRight className="h-4 w-4 text-success-600" /> : null
        }
      },
      {
        title: "Current Applications",
        value: pendingApplications.reduce((sum, app) => sum + app.applicationsCount, 0),
        description: pendingApplications.length > 0 
          ? `From ${pendingApplications.length} ${pendingApplications.length === 1 ? 'Property' : 'Properties'}` 
          : "No pending applications",
        icon: <ClipboardList className="h-5 w-5 text-primary-600" />,
        trend: {
          value: pendingApplications.length > 0 ? "Positive" : "Neutral",
          icon: pendingApplications.length > 0 
            ? <ArrowUpRight className="h-4 w-4 text-primary-600" /> 
            : null
        }
      }
    ],
    tenant: [
      {
        title: "My Properties",
        value: properties.length,
        description: `${properties.length} Rented Properties`,
        icon: <Home className="h-5 w-5 text-primary-600" />,
        trend: {
          value: "Neutral",
          icon: null
        }
      },
      {
        title: "Active Leases",
        value: leases.filter(l => l.status === "active").length,
        description: `${Math.round((leases.filter(l => l.status === "active").length / Math.max(leases.length, 1)) * 100)}% Active Contracts`,
        icon: <FileText className="h-5 w-5 text-warning-600" />,
        trend: {
          value: "Neutral",
          icon: null
        }
      },
      {
        title: "Paid This Month",
        value: formatCurrency(totalPaidAmount),
        description: `${paidPaymentsThisMonth.length} Payments Made`,
        icon: <DollarSign className="h-5 w-5 text-success-600" />,
        trend: {
          value: "Neutral",
          icon: null
        }
      },
      {
        title: "Due Payments",
        value: pendingPaymentsCount,
        description: pendingPaymentsCount > 0 
          ? `${formatCurrency(payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0))} Due` 
          : "No pending payments",
        icon: <CreditCard className="h-5 w-5 text-gray-600" />,
        trend: {
          value: pendingPaymentsCount > 0 ? "Warning" : "Positive",
          icon: pendingPaymentsCount > 0 
            ? <ArrowUpRight className="h-4 w-4 text-warning-600" /> 
            : <ArrowDownRight className="h-4 w-4 text-success-600" />
        }
      }
    ]
  };
  
  const currentStats = stats[userRole];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {currentStats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-medium text-gray-900">{stat.title}</CardTitle>
              <CardDescription className="text-xs">{stat.description}</CardDescription>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              {stat.trend.icon && (
                <div className="flex items-center text-xs font-medium">
                  {stat.trend.icon}
                  <span className={`ml-1 ${
                    stat.trend.value === "Positive" ? "text-success-600" : 
                    stat.trend.value === "Negative" ? "text-destructive-600" : 
                    stat.trend.value === "Warning" ? "text-warning-600" : "text-gray-600"
                  }`}>
                    {stat.trend.value}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}