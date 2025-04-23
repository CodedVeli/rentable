import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { FileText, CreditCard, Search, Wrench } from "lucide-react";

export default function QuickActions() {
  // Define quick actions
  const actions = [
    {
      icon: <FileText className="text-primary-600" />,
      title: "Create Lease",
      href: "/landlord/leases/new"
    },
    {
      icon: <CreditCard className="text-primary-600" />,
      title: "Request Payment",
      href: "/landlord/payments/new"
    },
    {
      icon: <Search className="text-primary-600" />,
      title: "Screen Tenant",
      href: "/landlord/tenants/screening"
    },
    {
      icon: <Wrench className="text-primary-600" />,
      title: "Manage Repairs",
      href: "/landlord/maintenance"
    }
  ];

  return (
    <Card className="overflow-hidden shadow">
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <a className="group flex flex-col items-center p-3 rounded-md hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mb-2 group-hover:bg-primary-200">
                  {action.icon}
                </div>
                <span className="text-sm text-gray-700">{action.title}</span>
              </a>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
