import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-lg shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-xl font-semibold text-midnight cursor-pointer">Rentr</h1>
        </Link>
        <nav className="hidden md:flex space-x-8 text-slate-600">
          <a href="/#features" className="hover:text-accent">Features</a>
          <a href="/#pricing" className="hover:text-accent">Pricing</a>
          <a href="/#about" className="hover:text-accent">About</a>
        </nav>
        <div className="flex items-center space-x-4">
          {user ? (
            <Link href={user.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard"}>
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="outline" className="hover:text-accent">Log in</Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}