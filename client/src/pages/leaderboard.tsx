import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import MotionCard from "@/components/ui/motion-card";
import { 
  ArrowLeft,
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Users,
  Filter,
  MapPin,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Get leaderboard data
  const { data: leaderboard, isLoading: leaderboardLoading, error } = useQuery({
    queryKey: ["/api/leaderboard", `sport=${selectedSport}&metric=${selectedMetric}&limit=50`],
    retry: false,
  });

  // Get top athletes for highlights
  const { data: topAthletes } = useQuery({
    queryKey: ["/api/athletes/top/3"],
    retry: false,
  });

  // Handle errors
  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <h2 className="text-xl font-heading font-bold text-primary">KALA KAUSHAL</h2>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  // Use comprehensive sports list from constants
  const sports = [
    "Cricket", "Football (Soccer)", "Basketball", "Volleyball", "Tennis", "Badminton",
    "Athletics (Track & Field)", "Swimming", "Hockey", "Boxing", "Wrestling", "Archery",
    "Kabaddi", "Kho Kho", "Table Tennis", "Cycling", "Gymnastics", "Weightlifting"
  ];
  const metrics = ["Overall", "Speed", "Agility", "Endurance", "Strength"];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50";
      default:
        return "hover:bg-muted/50";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="mb-4 text-muted-foreground hover:text-foreground"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2">
              🏆 Leaderboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Top performing athletes across India
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        
        {/* Top 3 Podium */}
        {topAthletes && topAthletes.length >= 3 && (
          <MotionCard delay={0.1} className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-heading font-bold text-center text-foreground mb-6">
                🥇 Top Performers
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="order-2 md:order-1"
                >
                  <div className="text-center">
                    <div className="relative">
                      <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-gray-400">
                        <AvatarImage src="/athlete-2.jpg" alt="2nd Place" />
                        <AvatarFallback className="bg-gray-400 text-white text-xl">2</AvatarFallback>
                      </Avatar>
                      <Medal className="w-8 h-8 text-gray-400 absolute -top-2 -right-2" />
                    </div>
                    <h3 className="font-heading font-bold text-foreground mb-1">
                      Athlete #{topAthletes[1]?.id?.slice(-4)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {topAthletes[1]?.primarySport} • {topAthletes[1]?.location}
                    </p>
                    <div className="text-2xl font-bold text-gray-400">
                      {parseFloat(topAthletes[1]?.overallRating || "0").toFixed(1)}
                    </div>
                  </div>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="order-1 md:order-2"
                >
                  <div className="text-center relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Crown className="w-8 h-8 text-yellow-500 animate-float" />
                    </div>
                    <div className="relative">
                      <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-yellow-500">
                        <AvatarImage src="/athlete-1.jpg" alt="1st Place" />
                        <AvatarFallback className="bg-yellow-500 text-white text-xl">1</AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="font-heading font-bold text-foreground mb-1 text-lg">
                      Athlete #{topAthletes[0]?.id?.slice(-4)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {topAthletes[0]?.primarySport} • {topAthletes[0]?.location}
                    </p>
                    <div className="text-3xl font-bold text-yellow-500">
                      {parseFloat(topAthletes[0]?.overallRating || "0").toFixed(1)}
                    </div>
                    <Badge className="mt-2 bg-yellow-500 text-yellow-900">
                      Champion
                    </Badge>
                  </div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="order-3"
                >
                  <div className="text-center">
                    <div className="relative">
                      <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-amber-600">
                        <AvatarImage src="/athlete-3.jpg" alt="3rd Place" />
                        <AvatarFallback className="bg-amber-600 text-white text-xl">3</AvatarFallback>
                      </Avatar>
                      <Medal className="w-8 h-8 text-amber-600 absolute -top-2 -right-2" />
                    </div>
                    <h3 className="font-heading font-bold text-foreground mb-1">
                      Athlete #{topAthletes[2]?.id?.slice(-4)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {topAthletes[2]?.primarySport} • {topAthletes[2]?.location}
                    </p>
                    <div className="text-2xl font-bold text-amber-600">
                      {parseFloat(topAthletes[2]?.overallRating || "0").toFixed(1)}
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </MotionCard>
        )}

        {/* Filters */}
        <MotionCard delay={0.2} className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-heading font-bold">
              <Filter className="w-5 h-5 mr-2 text-primary" />
              Filter Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sport Category
                </label>
                <select 
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground"
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  data-testid="select-sport-filter"
                >
                  <option value="">All Sports</option>
                  {sports.map((sport) => (
                    <option key={sport} value={sport.toLowerCase()}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Performance Metric
                </label>
                <select 
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground"
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  data-testid="select-metric-filter"
                >
                  <option value="">Overall Rating</option>
                  {metrics.map((metric) => (
                    <option key={metric} value={metric.toLowerCase()}>
                      {metric}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </MotionCard>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="national" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="national" data-testid="tab-national">National</TabsTrigger>
            <TabsTrigger value="state" data-testid="tab-state">State</TabsTrigger>
            <TabsTrigger value="local" data-testid="tab-local">Local</TabsTrigger>
          </TabsList>

          <TabsContent value="national" className="mt-6">
            <MotionCard delay={0.3}>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-heading font-bold">
                  <Trophy className="w-6 h-6 mr-2 text-primary" />
                  National Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboardLoading ? (
                  <div className="space-y-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="animate-pulse p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-muted rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                          <div className="h-6 bg-muted rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard?.slice(0, 20).map((athlete: any, index: number) => {
                      const rank = index + 1;
                      return (
                        <motion.div
                          key={athlete.athleteId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className={`p-4 border border-border rounded-lg transition-all hover-glow ${getRankColor(rank)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-12 h-12">
                                {getRankIcon(rank)}
                              </div>
                              
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={`/athlete-${rank}.jpg`} alt="Athlete" />
                                <AvatarFallback className="bg-muted text-foreground">
                                  {athlete.athleteName?.charAt(0) || "A"}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div>
                                <h3 className="font-medium text-foreground">
                                  {athlete.athleteName || `Athlete #${athlete.athleteId?.slice(-4)}`}
                                </h3>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  {athlete.sport || "Multi-Sport"}
                                  {athlete.location && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {athlete.location}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-secondary mr-1" />
                                <span className="text-lg font-bold text-foreground">
                                  {parseFloat(athlete.rating || "0").toFixed(1)}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Rating
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }) || (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No athletes found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </MotionCard>
          </TabsContent>

          <TabsContent value="state" className="mt-6">
            <MotionCard delay={0.3}>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                  State Rankings Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  State-wise leaderboards are being prepared and will be available soon.
                </p>
              </CardContent>
            </MotionCard>
          </TabsContent>

          <TabsContent value="local" className="mt-6">
            <MotionCard delay={0.3}>
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                  Local Rankings Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  City and district-wise rankings will be available once we have more local data.
                </p>
              </CardContent>
            </MotionCard>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <MotionCard delay={0.4} className="text-center">
          <CardContent className="p-6">
            <h3 className="text-xl font-heading font-bold text-foreground mb-2">
              Want to climb the rankings?
            </h3>
            <p className="text-muted-foreground mb-4">
              Take more assessments to improve your performance score and move up the leaderboard.
            </p>
            <Link href="/assessment">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Trophy className="w-4 h-4 mr-2" />
                Take Assessment
              </Button>
            </Link>
          </CardContent>
        </MotionCard>
      </main>
    </div>
  );
}
