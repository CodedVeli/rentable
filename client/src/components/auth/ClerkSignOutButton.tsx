import { SignOutButton } from "@clerk/clerk-react";

export function ClerkSignOutButton({ className = "" }: { className?: string }) {
  return (
    <SignOutButton>
      <button className={className + " text-red-600 hover:underline"}>
        Sign Out
      </button>
    </SignOutButton>
  );
}
