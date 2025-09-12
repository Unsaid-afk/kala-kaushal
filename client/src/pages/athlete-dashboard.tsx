import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MobileNav from "@/components/layout/mobile-nav";
import MotionCard from "@/components/ui/motion-card";
import ProgressRing from "@/components/ui/progress-ring";
import GlowingButton from "@/components/ui/glowing-button";
import TestSelection from "@/components/test-selection";
import { 
  Trophy, 
  Video, 
  Target, 
  TrendingUp, 
  Medal, 
  Play,
  Star,
  Users,
  Calendar,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

interface AthleteProfile {
  id: string;
  age?: number;
  height?: string;
  weight?: string;
  location?: string;
  primarySport?: string;
  overallRating?: string;
  isVerified: boolean;
}

export default function AthleteDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  // Get athlete profile
  const { data: athlete, isLoading: athleteLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Get test types
  const { data: testTypes, isLoading: testTypesLoading } = useQuery({
    queryKey: ["/api/test-types"],
    retry: false,
  });

  // Get recent assessments
  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/athletes", athlete?.athlete?.id, "assessments"],
    enabled: !!athlete?.athlete?.id,
    retry: false,
  });

  // Get achievements
  const { data: achievements } = useQuery({
    queryKey: ["/api/athletes", athlete?.athlete?.id, "achievements"],
    enabled: !!athlete?.athlete?.id,
    retry: false,
  });

  // Create athlete profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await apiRequest("POST", "/api/athletes", profileData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setShowOnboarding(false);
      toast({
        title: "Profile Created!",
        description: "Your athlete profile has been created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (athlete && !athlete.athlete && !createProfileMutation.isPending) {
      setShowOnboarding(true);
    }
  }, [athlete, createProfileMutation.isPending]);

  if (isLoading || athleteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="spinner mb-4 loading-pulse"></div>
          <motion.h2 
            className="text-xl font-heading font-bold text-primary breathe"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            KALA KAUSHAL
          </motion.h2>
          <motion.p 
            className="text-muted-foreground"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Loading your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <MotionCard 
          variant="gradient" 
          className="w-full max-w-2xl"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
        >
          <CardHeader className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <CardTitle className="text-3xl font-heading font-bold text-primary mb-2 text-reveal">
                Welcome to KALA KAUSHAL!
              </CardTitle>
            </motion.div>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Let's create your athlete profile to get started
            </motion.p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Profile creation form would go here */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholder="Enter your age"
                    data-testid="input-age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Primary Sport
                  </label>
                  <select 
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground"
                    data-testid="select-sport"
                  >
                    <option value="">Select Sport</option>
                    <option value="cricket">Cricket</option>
                    <option value="football">Football</option>
                    <option value="athletics">Athletics</option>
                    <option value="basketball">Basketball</option>
                  </select>
                </div>
              </div>
              
              <GlowingButton
                onClick={() => {
                  const profileData = {
                    age: 20,
                    primarySport: "cricket",
                    location: "Mumbai",
                    height: "175",
                    weight: "70"
                  };
                  createProfileMutation.mutate(profileData);
                }}
                disabled={createProfileMutation.isPending}
                className="w-full"
                data-testid="button-create-profile"
              >
                {createProfileMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    Creating Profile...
                  </div>
                ) : (
                  "Create My Profile"
                )}
              </GlowingButton>
            </div>
          </CardContent>
        </MotionCard>
      </div>
    );
  }

  const athleteProfile = athlete?.athlete as AthleteProfile;
  const recentAssessments = assessments?.slice(0, 3) || [];
  const completedTests = assessments?.filter((a: any) => a.status === 'completed').length || 0;
  const overallRating = parseFloat(athleteProfile?.overallRating || "0");

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <MobileNav userRole="athlete" />

      {/* Main Content */}
      <div className="pb-20 md:pb-6">
        {/* Header */}
        <motion.header 
          className="glass-morphism border-b border-border p-4 md:p-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-2xl md:text-3xl font-heading font-bold breathe">
                KALA KAUSHAL
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user?.firstName || "Athlete"}! 
                {athleteProfile?.isVerified && (
                  <motion.div
                    className="inline-block"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  >
                    <Badge className="ml-2 bg-accent text-accent-foreground success-bounce">
                      <Medal className="w-3 h-3 mr-1 animate-pulse" />
                      Verified
                    </Badge>
                  </motion.div>
                )}
              </p>
            </motion.div>
            <motion.div 
              className="text-right"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.div 
                className="text-2xl font-bold text-primary counter interactive-glow"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 150 }}
              >
                {overallRating.toFixed(1)}
              </motion.div>
              <div className="text-sm text-muted-foreground">Overall Rating</div>
            </motion.div>
          </div>
        </motion.header>

        {/* Dashboard Content */}
        <main className="p-4 md:p-6">
          
          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <MotionCard variant="enhanced" delay={0} className="card-enhanced">
              <CardContent className="p-4 text-center">
                <motion.div 
                  className="text-2xl font-bold text-primary counter"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  {completedTests}
                </motion.div>
                <div className="text-sm text-muted-foreground">Tests Done</div>
                <Trophy className="w-4 h-4 mx-auto mt-2 text-primary animate-float" />
              </CardContent>
            </MotionCard>
            
            <MotionCard variant="enhanced" delay={0.1} className="card-enhanced">
              <CardContent className="p-4 text-center">
                <motion.div 
                  className="text-2xl font-bold text-secondary counter"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  {overallRating.toFixed(1)}
                </motion.div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
                <Star className="w-4 h-4 mx-auto mt-2 text-secondary animate-pulse-slow" />
              </CardContent>
            </MotionCard>
            
            <MotionCard variant="enhanced" delay={0.2} className="card-enhanced">
              <CardContent className="p-4 text-center">
                <motion.div 
                  className="text-2xl font-bold text-accent counter"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  {achievements?.length || 0}
                </motion.div>
                <div className="text-sm text-muted-foreground">Badges</div>
                <Award className="w-4 h-4 mx-auto mt-2 text-accent animate-glow" />
              </CardContent>
            </MotionCard>
            
            <MotionCard delay={0.3}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  #{Math.floor(Math.random() * 500) + 1}
                </div>
                <div className="text-sm text-muted-foreground">Rank</div>
              </CardContent>
            </MotionCard>
          </motion.div>

          {/* Test Selection */}
          <div className="mb-6">
            <h2 className="text-xl font-heading font-bold text-foreground mb-4">
              Available Tests
            </h2>
            {testTypesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-12 bg-muted rounded mb-4"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <TestSelection testTypes={testTypes || []} />
            )}
          </div>

          {/* Recent Activity & Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Recent Assessments */}
            <MotionCard delay={0.2}>
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-heading font-bold">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessmentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentAssessments.length > 0 ? (
                  <div className="space-y-4">
                    {recentAssessments.map((assessment: any, index: number) => (
                      <motion.div
                        key={assessment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {assessment.testType?.name || "Assessment"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(assessment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={assessment.status === 'completed' ? 'default' : 'secondary'}
                          className={assessment.status === 'completed' ? 'bg-accent' : ''}
                        >
                          {assessment.status}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No assessments yet</p>
                    <p className="text-sm text-muted-foreground">Take your first test to get started!</p>
                  </div>
                )}
              </CardContent>
            </MotionCard>

            {/* Progress Chart */}
            <MotionCard delay={0.3}>
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-heading font-bold">
                  <TrendingUp className="mr-2 h-5 w-5 text-secondary" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <ProgressRing value={overallRating} size={120} strokeWidth={8} />
                  <div className="mt-4">
                    <div className="text-xl font-bold text-primary">{overallRating.toFixed(1)}/10</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: "Speed", value: 85, color: "bg-primary" },
                    { name: "Agility", value: 78, color: "bg-secondary" },
                    { name: "Endurance", value: 92, color: "bg-accent" },
                    { name: "Strength", value: 74, color: "bg-primary" }
                  ].map((metric, index) => (
                    <div key={metric.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{metric.name}</span>
                        <span className="text-muted-foreground">{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </MotionCard>
          </div>

          {/* Achievements */}
          <MotionCard delay={0.4}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-heading font-bold">
                <Award className="mr-2 h-5 w-5 text-accent" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievements.slice(0, 4).map((achievement: any, index: number) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-center p-4 bg-muted/50 rounded-lg hover-glow"
                    >
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2 animate-float">
                        <Trophy className="h-6 w-6 text-accent-foreground" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground mb-1">
                        {achievement.achievement?.name || "Achievement"}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No achievements yet</p>
                  <p className="text-sm text-muted-foreground">Complete tests to earn your first badge!</p>
                </div>
              )}
            </CardContent>
          </MotionCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Link href="/assessment">
              <GlowingButton className="w-full h-20" data-testid="button-start-test">
                <div className="text-center">
                  <Play className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">Start New Test</div>
                </div>
              </GlowingButton>
            </Link>
            
            <Link href="/leaderboard">
              <Button 
                variant="outline" 
                className="w-full h-20 border-secondary text-secondary hover:bg-secondary/10"
                data-testid="button-view-leaderboard"
              >
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">View Leaderboard</div>
                </div>
              </Button>
            </Link>
            
            {athlete?.athlete?.id ? (
              <Link href={`/athlete/${athlete.athlete.id}`}>
                <Button 
                  variant="outline" 
                  className="w-full h-20 border-accent text-accent hover:bg-accent/10"
                  data-testid="button-view-profile"
                >
                  <div className="text-center">
                    <Star className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">My Profile</div>
                  </div>
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline" 
                className="w-full h-20 border-accent text-accent opacity-50 cursor-not-allowed"
                disabled
                data-testid="button-view-profile"
              >
                <div className="text-center">
                  <Star className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">My Profile</div>
                </div>
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
