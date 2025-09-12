import { Link, useLocation } from "wouter";
import { Home, Video, Trophy, User, Plus, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  userRole: "athlete" | "scout";
}

export default function MobileNav({ userRole }: MobileNavProps) {
  const [location] = useLocation();

  const athleteNavItems = [
    { icon: Home, label: "Home", href: "/", testId: "nav-home" },
    { icon: Video, label: "Tests", href: "/assessment", testId: "nav-tests" },
    { icon: Plus, label: "Record", href: "/assessment", testId: "nav-record", isMain: true },
    { icon: Trophy, label: "Rankings", href: "/leaderboard", testId: "nav-rankings" },
    { icon: User, label: "Profile", href: "/profile", testId: "nav-profile" },
  ];

  const scoutNavItems = [
    { icon: BarChart3, label: "Dashboard", href: "/", testId: "nav-dashboard" },
    { icon: Users, label: "Athletes", href: "/athletes", testId: "nav-athletes" },
    { icon: Plus, label: "Search", href: "/", testId: "nav-search", isMain: true },
    { icon: Trophy, label: "Rankings", href: "/leaderboard", testId: "nav-rankings" },
    { icon: User, label: "Profile", href: "/profile", testId: "nav-profile" },
  ];

  const navItems = userRole === "athlete" ? athleteNavItems : scoutNavItems;

  return (
    <nav className="nav-mobile bg-card border-t border-border">
      <div className="flex justify-around items-center py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          const isMain = item.isMain;

          return (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "flex flex-col items-center space-y-1 transition-colors",
                  isMain
                    ? "text-primary"
                    : isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
                data-testid={item.testId}
              >
                {isMain ? (
                  <div className="bg-primary rounded-full p-2 animate-glow">
                    <Icon className="text-primary-foreground text-xl" size={20} />
                  </div>
                ) : (
                  <Icon size={20} />
                )}
                <span className="text-xs">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
