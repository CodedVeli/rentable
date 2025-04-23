import { Card, CardContent } from "@/components/ui/card";

export default function DashboardCards() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="bg-white rounded-2xl shadow-soft">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2">Tenant Score</h2>
          <p className="text-slate-600">752 — Excellent</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white rounded-2xl shadow-soft">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2">Upcoming Viewing</h2>
          <p className="text-slate-600">Tomorrow @ 2PM</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white rounded-2xl shadow-soft">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2">Pending Lease</h2>
          <p className="text-slate-600">#Rent-1244 needs signature</p>
        </CardContent>
      </Card>
    </div>
  );
}