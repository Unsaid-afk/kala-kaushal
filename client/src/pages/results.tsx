import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import MotionCard from "@/components/ui/motion-card";
import ProgressRing from "@/components/ui/progress-ring";
import GlowingButton from "@/components/ui/glowing-button";
import { 
  ArrowLeft,
  Trophy,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Share,
  Download,
  Home,
  Repeat,
  Star,
  Zap,
  Award,
  Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";

export default function Results() {
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

  // Get assessment data with results
  const { data: assessment, isLoading: assessmentLoading, error } = useQuery({
    queryKey: ["/api/assessments", id],
    enabled: !!id && isAuthenticated,
    retry: false,
    refetchInterval: (data) => {
      // Keep polling if status is processing
      return data?.status === 'processing' ? 2000 : false;
    }
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

  if (isLoading || assessmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <h2 className="text-xl font-heading font-bold text-primary">KALA KAUSHAL</h2>
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold text-foreground mb-2">
              Results Not Found
            </h2>
            <p className="text-muted-foreground mb-4">
              The assessment results you're looking for don't exist or are still being processed.
            </p>
            <Link href="/">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show processing state
  if (assessment.status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <MotionCard className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"
            />
            <h2 className="text-2xl font-heading font-bold text-primary mb-2">
              AI Analysis in Progress
            </h2>
            <p className="text-muted-foreground mb-6">
              Our advanced AI is analyzing your performance. This usually takes 30-60 seconds.
            </p>
            <div className="space-y-2 text-left">
              {[
                "Processing video footage...",
                "Analyzing movement patterns...",
                "Calculating performance metrics...",
                "Generating insights..."
              ].map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="flex items-center text-sm text-muted-foreground"
                >
                  <Zap className="w-4 h-4 mr-2 text-primary" />
                  {step}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </MotionCard>
      </div>
    );
  }

  // Show failed state
  if (assessment.status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold text-foreground mb-2">
              Analysis Failed
            </h2>
            <p className="text-muted-foreground mb-4">
              We couldn't analyze your video. This might be due to poor video quality or technical issues.
            </p>
            <div className="space-y-2">
              <Link href={`/assessment/${id}/record`}>
                <Button className="w-full">
                  <Repeat className="w-4 h-4 mr-2" />
                  Try Recording Again
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const results = assessment.aiAnalysisResults;
  const performanceScore = results?.performanceScore || 0;
  const metrics = assessment.metrics || results?.metrics || [];
  const feedback = results?.feedback || "Assessment completed successfully.";
  const formAnalysis = results?.formAnalysis || {};

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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-lg">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                  Assessment Results
                </h1>
                <p className="text-muted-foreground">
                  AI-powered performance analysis complete
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{performanceScore}</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
          </div>
        </div>
      </header>

      {/* Celebration Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 pointer-events-none z-50"
      >
        {/* Confetti particles would be animated here */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 1, 
              y: -10, 
              x: Math.random() * window.innerWidth,
              rotate: 0 
            }}
            animate={{ 
              y: window.innerHeight + 100, 
              rotate: 360,
              opacity: 0 
            }}
            transition={{ 
              duration: 3, 
              delay: i * 0.1,
              ease: "linear"
            }}
            className="absolute w-3 h-3 bg-accent rounded-full"
            style={{
              left: Math.random() * 100 + '%',
            }}
          />
        ))}
      </motion.div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        
        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <MotionCard delay={0.1} className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-heading font-bold">
                <TrendingUp className="w-6 h-6 mr-2 text-primary" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <ProgressRing 
                    value={performanceScore} 
                    size={160} 
                    strokeWidth={8}
                    className="mb-4"
                  />
                  <h3 className="text-2xl font-bold text-primary mb-1">
                    {performanceScore}/100
                  </h3>
                  <p className="text-muted-foreground">Overall Performance</p>
                  <div className="flex justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(performanceScore / 20) 
                            ? "text-secondary fill-current" 
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">AI Analysis Summary</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feedback}
                    </p>
                  </div>
                  
                  {formAnalysis.overallForm && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">Technique Score</span>
                        <span className="text-muted-foreground">{formAnalysis.overallForm}%</span>
                      </div>
                      <Progress value={formAnalysis.overallForm} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </MotionCard>
          
          {/* Quick Actions */}
          <MotionCard delay={0.2}>
            <CardHeader>
              <CardTitle className="text-lg font-heading font-bold">What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/assessment">
                <GlowingButton className="w-full" data-testid="button-take-another">
                  <Repeat className="w-4 h-4 mr-2" />
                  Take Another Test
                </GlowingButton>
              </Link>
              
              <Button variant="outline" className="w-full" data-testid="button-share-results">
                <Share className="w-4 h-4 mr-2" />
                Share Results
              </Button>
              
              <Button variant="outline" className="w-full" data-testid="button-download-report">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </MotionCard>
        </div>

        {/* Detailed Metrics */}
        {metrics.length > 0 && (
          <MotionCard delay={0.3} className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-heading font-bold">
                <Target className="w-6 h-6 mr-2 text-secondary" />
                Detailed Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((metric: any, index: number) => (
                  <motion.div
                    key={metric.name || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center p-4 bg-muted/50 rounded-lg hover-glow"
                  >
                    <div className="text-2xl font-bold text-primary mb-1">
                      {metric.value || "N/A"}
                    </div>
                    <div className="text-sm text-foreground mb-1">
                      {metric.name || "Metric"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metric.unit && `(${metric.unit})`}
                    </div>
                    {metric.confidence && (
                      <div className="mt-2">
                        <Progress value={metric.confidence * 100} className="h-1" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {(metric.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </MotionCard>
        )}

        {/* Form Analysis */}
        {(formAnalysis.strengths?.length > 0 || formAnalysis.improvements?.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Strengths */}
            {formAnalysis.strengths?.length > 0 && (
              <MotionCard delay={0.4}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-heading font-bold text-accent">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {formAnalysis.strengths.map((strength: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-accent" />
                        </div>
                        <p className="text-foreground">{strength}</p>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </MotionCard>
            )}

            {/* Areas for Improvement */}
            {formAnalysis.improvements?.length > 0 && (
              <MotionCard delay={0.5}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-heading font-bold text-secondary">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {formAnalysis.improvements.map((improvement: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Lightbulb className="w-4 h-4 text-secondary" />
                        </div>
                        <p className="text-foreground">{improvement}</p>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </MotionCard>
            )}
          </div>
        )}

        {/* Achievement Unlocked */}
        {performanceScore >= 80 && (
          <MotionCard 
            delay={0.6}
            className="bg-gradient-to-r from-accent/20 to-primary/20 border-accent/50"
          >
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 1,
                  type: "spring",
                  stiffness: 200
                }}
              >
                <Award className="w-16 h-16 text-accent mx-auto mb-4 animate-float" />
              </motion.div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                🎉 Achievement Unlocked!
              </h3>
              <p className="text-muted-foreground mb-4">
                Outstanding Performance - You scored {performanceScore}% and earned a new badge!
              </p>
              <Badge className="bg-accent text-accent-foreground px-4 py-2">
                High Performer
              </Badge>
            </CardContent>
          </MotionCard>
        )}
      </main>
    </div>
  );
}
