import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Users, 
  Video, 
  Trophy, 
  Settings, 
  Home, 
  Target,
  User,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface DesktopSidebarProps {
  userRole: "athlete" | "scout";
}

export default function DesktopSidebar({ userRole }: DesktopSidebarProps) {
  const [location] = useLocation();

  const athleteNavItems = [
    { icon: Home, label: "Dashboard", href: "/", testId: "nav-dashboard" },
    { icon: Video, label: "Assessments", href: "/assessment", testId: "nav-assessments" },
    { icon: Trophy, label: "Leaderboards", href: "/leaderboard", testId: "nav-leaderboards" },
    { icon: Target, label: "Goals", href: "/goals", testId: "nav-goals" },
    { icon: User, label: "Profile", href: "/profile", testId: "nav-profile" },
    { icon: Settings, label: "Settings", href: "/settings", testId: "nav-settings" },
  ];

  const scoutNavItems = [
    { icon: BarChart3, label: "Dashboard", href: "/", testId: "nav-dashboard" },
    { icon: Users, label: "Athletes", href: "/athletes", testId: "nav-athletes" },
    { icon: Video, label: "Assessments", href: "/assessments", testId: "nav-assessments" },
    { icon: Trophy, label: "Leaderboards", href: "/leaderboard", testId: "nav-leaderboards" },
    { icon: Settings, label: "Settings", href: "/settings", testId: "nav-settings" },
  ];

  const navItems = userRole === "athlete" ? athleteNavItems : scoutNavItems;

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r border-border">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <h1 className="font-heading text-2xl font-bold text-primary tracking-wide">
            KALA KAUSHAL
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI Sports Assessment
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg transition-all",
                    isActive
                      ? "text-primary bg-primary/10 hover-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  data-testid={item.testId}
                >
                  <Icon className="mr-3" size={20} />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/default-avatar.png" alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User size={20} />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {userRole === "scout" ? "Scout Admin" : "Athlete"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userRole === "scout" ? "scout@kalakaushal.in" : "athlete@kalakaushal.in"}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => window.location.href = "/api/logout"}
            data-testid="button-logout"
          >
            <LogOut className="mr-2" size={16} />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
