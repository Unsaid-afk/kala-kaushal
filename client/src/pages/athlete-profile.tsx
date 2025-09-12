import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import ProgressRing from "@/components/ui/progress-ring";
import PerformanceChart from "@/components/performance-chart";
import AIInsightsPanel from "@/components/ai-insights-panel";
import VideoGallery from "@/components/video-gallery";
import { 
  MapPin, 
  Calendar, 
  Ruler, 
  Weight, 
  Trophy, 
  Video, 
  TrendingUp, 
  Medal,
  Star,
  Eye,
  Share,
  Download
} from "lucide-react";
import { motion } from "framer-motion";

export default function AthleteProfile() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  // Get athlete data
  const { data: athlete, isLoading: athleteLoading, error } = useQuery({
    queryKey: ["/api/athletes", id],
    enabled: !!id && isAuthenticated,
    retry: false,
  });

  // Get athlete assessments
  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/athletes", id, "assessments"],
    enabled: !!id && !!athlete,
    retry: false,
  });

  // Get athlete achievements
  const { data: achievements } = useQuery({
    queryKey: ["/api/athletes", id, "achievements"],
    enabled: !!id && !!athlete,
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

  if (isLoading || athleteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <h2 className="text-xl font-heading font-bold text-primary">KALA KAUSHAL</h2>
          <p className="text-muted-foreground">Loading athlete profile...</p>
        </div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🏃‍♂️</div>
            <h2 className="text-xl font-heading font-bold text-foreground mb-2">
              Athlete Not Found
            </h2>
            <p className="text-muted-foreground mb-4">
              The athlete profile you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallRating = parseFloat((athlete as any)?.overallRating || "0");
  const completedAssessments = (assessments as any)?.filter((a: any) => a.status === 'completed') || [];
  const totalAssessments = (assessments as any)?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4 text-muted-foreground hover:text-foreground"
            data-testid="button-back"
          >
            ← Back
          </Button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarImage src="/default-avatar.png" alt="Athlete" />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {(athlete as any)?.userId?.charAt(0)?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-heading font-bold text-foreground">
                  Athlete Profile
                </h1>
                {(athlete as any)?.isVerified && (
                  <Badge className="bg-accent text-accent-foreground">
                    <Medal className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {(athlete as any)?.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {(athlete as any)?.location}
                  </div>
                )}
                {(athlete as any)?.primarySport && (
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 mr-1" />
                    {(athlete as any)?.primarySport}
                  </div>
                )}
                {(athlete as any)?.age && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {(athlete as any)?.age} years old
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-primary">
                  {overallRating.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">/ 10.0</div>
                <div className="flex ml-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(overallRating / 2) 
                          ? "text-secondary fill-current" 
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" data-testid="button-share">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" data-testid="button-download">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="glow-border hover-glow animate-slide-up">
            <CardContent className="p-4 text-center">
              <Video className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{totalAssessments}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </CardContent>
          </Card>
          
          <Card className="glow-border hover-glow animate-slide-up">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{completedAssessments.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          
          <Card className="glow-border hover-glow animate-slide-up">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{(achievements as any)?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </CardContent>
          </Card>
          
          <Card className="glow-border hover-glow animate-slide-up">
            <CardContent className="p-4 text-center">
              <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {Math.floor(Math.random() * 100) + 50}
              </div>
              <div className="text-sm text-muted-foreground">Profile Views</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="assessments" data-testid="tab-assessments">Assessments</TabsTrigger>
            <TabsTrigger value="achievements" data-testid="tab-achievements">Achievements</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* AI Insights Panel */}
              {id && <AIInsightsPanel athleteId={id} />}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Physical Stats */}
                <Card className="glow-border hover-glow">
                  <CardHeader>
                    <CardTitle className="text-lg font-heading font-bold">Physical Attributes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {(athlete as any)?.height && (
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <Ruler className="w-6 h-6 text-primary mx-auto mb-2" />
                          <div className="text-xl font-bold text-foreground">{(athlete as any)?.height} cm</div>
                          <div className="text-sm text-muted-foreground">Height</div>
                        </div>
                      )}
                      {(athlete as any)?.weight && (
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <Weight className="w-6 h-6 text-secondary mx-auto mb-2" />
                          <div className="text-xl font-bold text-foreground">{(athlete as any)?.weight} kg</div>
                          <div className="text-sm text-muted-foreground">Weight</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Overview */}
                <Card className="glow-border hover-glow">
                  <CardHeader>
                    <CardTitle className="text-lg font-heading font-bold">Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <ProgressRing value={overallRating * 10} size={120} strokeWidth={8} />
                      <div className="mt-4">
                        <div className="text-2xl font-bold text-primary">{overallRating.toFixed(1)}/10</div>
                        <div className="text-sm text-muted-foreground">Overall Rating</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assessments" className="mt-6">
            <div className="space-y-6">
              {/* Video Gallery */}
              {id && <VideoGallery athleteId={id} />}
              
              {/* Assessment History */}
              <Card className="glow-border hover-glow">
                <CardHeader>
                  <CardTitle className="text-lg font-heading font-bold">Assessment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {assessmentsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse p-4 border border-border rounded-lg">
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (assessments as any)?.length > 0 ? (
                    <div className="space-y-4">
                      {(assessments as any).map((assessment: any, index: number) => (
                        <motion.div
                          key={assessment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-foreground">
                                {assessment.testType?.name || "Assessment"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(assessment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant={assessment.status === 'completed' ? 'default' : 'secondary'}
                                className={assessment.status === 'completed' ? 'bg-accent' : ''}
                              >
                                {assessment.status}
                              </Badge>
                              {assessment.performanceScore && (
                                <div className="text-sm font-medium text-primary mt-1">
                                  Score: {assessment.performanceScore}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No assessments found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <Card className="glow-border hover-glow">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-bold">Achievements & Badges</CardTitle>
              </CardHeader>
              <CardContent>
                {(achievements as any)?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(achievements as any).map((achievement: any, index: number) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="text-center p-4 bg-muted/50 rounded-lg hover-glow"
                      >
                        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 animate-float">
                          <Trophy className="h-8 w-8 text-accent-foreground" />
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glow-border hover-glow">
                <CardHeader>
                  <CardTitle className="text-lg font-heading font-bold">Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceChart assessments={assessments as any} />
                </CardContent>
              </Card>

              <Card className="glow-border hover-glow">
                <CardHeader>
                  <CardTitle className="text-lg font-heading font-bold">Detailed Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Speed", value: 85, color: "bg-primary" },
                      { name: "Agility", value: 78, color: "bg-secondary" },
                      { name: "Endurance", value: 92, color: "bg-accent" },
                      { name: "Strength", value: 74, color: "bg-primary" },
                      { name: "Coordination", value: 88, color: "bg-secondary" }
                    ].map((metric, index) => (
                      <div key={metric.name}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-foreground">{metric.name}</span>
                          <span className="text-muted-foreground">{metric.value}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                            className={`h-2 rounded-full ${metric.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
