import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useLocation } from "wouter";

export default function Onboard() {
  const { user } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const role = localStorage.getItem("selectedRole");
    if (user && role) {
      fetch("/api/clerk-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          role,
        }),
      }).then(() => {
        setLocation(role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard");
      });
    }
  }, [user, setLocation]);

  return <div className="min-h-screen flex items-center justify-center text-lg">Setting up your account...</div>;
}
