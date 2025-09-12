import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { MiniBar } from "@/components/layout/minibar";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AthleteDashboard from "@/pages/athlete-dashboard";
import ScoutDashboard from "@/pages/scout-dashboard";
import AthleteProfile from "@/pages/athlete-profile";
import Assessment from "@/pages/assessment";
import VideoRecording from "@/pages/video-recording";
import Results from "@/pages/results";
import Leaderboard from "@/pages/leaderboard";
import KalaPradarshan from "@/pages/kala-pradarshan";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Remove global loading gate to allow public routes to load

  return (
    <Switch>
      {/* Public routes - accessible to everyone */}
      <Route path="/kala-pradarshan" component={KalaPradarshan} />
      
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          {/* Route based on user role */}
          <Route path="/" component={(user as any)?.role === 'scout' ? ScoutDashboard : AthleteDashboard} />
          {/* Explicit dashboard routes */}
          <Route path="/athlete-dashboard" component={AthleteDashboard} />
          <Route path="/scout-dashboard" component={ScoutDashboard} />
          <Route path="/athlete/:id" component={AthleteProfile} />
          <Route path="/assessment" component={Assessment} />
          <Route path="/assessment/:id/record" component={VideoRecording} />
          <Route path="/results/:id" component={Results} />
          <Route path="/leaderboard" component={Leaderboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div>
          <Toaster />
          {/* Global MiniBar Navigation */}
          <MiniBar />
          {/* Main Application Content */}
          <main className="min-h-screen">
            <Router />
          </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
