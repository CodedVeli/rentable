import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

export function useClerkRoleSync(role: string | null) {
  const { user } = useUser();

  useEffect(() => {
    if (user && role) {
      fetch("/api/clerk-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          role,
        }),
      });
    }
  }, [user, role]);
}
