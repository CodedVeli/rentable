import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useLocation } from "wouter";

export default function AuthRedirect() {
  const { user } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function fetchAndRedirect() {
      if (!user) return;
      // Fetch user info from backend using Clerk id
      const res = await fetch(`/api/clerk-user-info?clerkId=${user.id}`);
      if (!res.ok) {
        setLocation("/onboard"); // fallback to onboarding if not found
        return;
      }
      const data = await res.json();
      if (data.role === "landlord") {
        setLocation("/landlord/dashboard");
      } else if (data.role === "tenant") {
        setLocation("/tenant/dashboard");
      } else {
        setLocation("/onboard"); // fallback if role is missing
      }
    }
    fetchAndRedirect();
  }, [user, setLocation]);

  return <div className="min-h-screen flex items-center justify-center text-lg">Logging you in...</div>;
}
