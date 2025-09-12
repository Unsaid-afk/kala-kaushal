import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MotionCard from "@/components/ui/motion-card";
import GlowingButton from "@/components/ui/glowing-button";
import TestSelection from "@/components/test-selection";
import { 
  ArrowLeft,
  Clock,
  Users,
  Trophy,
  Play,
  Info,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function Assessment() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);

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
  const { data: athlete } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Get test types
  const { data: testTypes = [], isLoading: testTypesLoading } = useQuery({
    queryKey: ["/api/test-types"],
    retry: false,
  });

  // Create assessment mutation
  const createAssessmentMutation = useMutation({
    mutationFn: async (testTypeId: string) => {
      const response = await apiRequest("POST", "/api/assessments", {
        testTypeId,
        status: "pending"
      });
      return response.json();
    },
    onSuccess: (assessment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/athletes"] });
      window.location.href = `/assessment/${assessment.id}/record`;
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
        description: "Failed to create assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <h2 className="text-xl font-heading font-bold text-primary">KALA KAUSHAL</h2>
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!athlete?.athlete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold text-foreground mb-2">
              Profile Required
            </h2>
            <p className="text-muted-foreground mb-4">
              You need to create an athlete profile before taking assessments.
            </p>
            <Link href="/">
              <Button>Create Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleTestSelect = (test: any) => {
    setSelectedTest(test);
    setShowInstructions(true);
  };

  const handleStartAssessment = () => {
    if (selectedTest) {
      createAssessmentMutation.mutate(selectedTest.id);
    }
  };

  if (showInstructions && selectedTest) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => setShowInstructions(false)}
              className="mb-4 text-muted-foreground hover:text-foreground"
              data-testid="button-back-to-selection"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Test Selection
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                  {selectedTest.name}
                </h1>
                <p className="text-muted-foreground">
                  {selectedTest.category} • {selectedTest.estimatedDuration} minutes
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Instructions */}
        <main className="max-w-4xl mx-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Instructions Content */}
            <div className="lg:col-span-2">
              <MotionCard delay={0.1}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-heading font-bold">
                    <Info className="w-5 h-5 mr-2 text-primary" />
                    Test Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Description</h3>
                    <p className="text-muted-foreground">
                      {selectedTest.description || "This test measures your athletic performance using advanced AI analysis."}
                    </p>
                  </div>

                  {selectedTest.instructions && (
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">How to Perform</h3>
                      <p className="text-foreground">
                        {selectedTest.instructions}
                      </p>
                    </div>
                  )}

                  {selectedTest.equipmentRequired?.length > 0 && (
                    <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">Equipment Required</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedTest.equipmentRequired.map((equipment: string, index: number) => (
                          <li key={index} className="text-foreground">{equipment}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Important Tips</h3>
                    <ul className="list-disc list-inside space-y-1 text-foreground">
                      <li>Ensure good lighting and clear camera view</li>
                      <li>Position your phone at the recommended distance</li>
                      <li>Wear appropriate athletic clothing</li>
                      <li>Warm up properly before starting</li>
                      <li>Follow the on-screen guidance during recording</li>
                    </ul>
                  </div>
                </CardContent>
              </MotionCard>
            </div>

            {/* Test Details Sidebar */}
            <div className="space-y-6">
              <MotionCard delay={0.2}>
                <CardHeader>
                  <CardTitle className="text-lg font-heading font-bold">Test Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="font-medium text-foreground">
                        ~{selectedTest.estimatedDuration} minutes
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-secondary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Category</div>
                      <div className="font-medium text-foreground">
                        {selectedTest.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-accent" />
                    <div>
                      <div className="text-sm text-muted-foreground">Difficulty</div>
                      <Badge 
                        variant="outline"
                        className={
                          selectedTest.difficultyLevel === 'beginner' ? 'border-accent text-accent' :
                          selectedTest.difficultyLevel === 'intermediate' ? 'border-secondary text-secondary' :
                          'border-destructive text-destructive'
                        }
                      >
                        {selectedTest.difficultyLevel}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </MotionCard>

              <MotionCard delay={0.3}>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <CheckCircle className="w-12 h-12 text-accent mx-auto mb-2" />
                    <h3 className="font-heading font-bold text-foreground">Ready to Start?</h3>
                    <p className="text-sm text-muted-foreground">
                      Make sure you've read all instructions carefully
                    </p>
                  </div>
                  
                  <GlowingButton
                    onClick={handleStartAssessment}
                    disabled={createAssessmentMutation.isPending}
                    className="w-full"
                    data-testid="button-start-assessment"
                  >
                    {createAssessmentMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="spinner mr-2"></div>
                        Creating Assessment...
                      </div>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Assessment
                      </>
                    )}
                  </GlowingButton>
                </CardContent>
              </MotionCard>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
              Choose Your Assessment
            </h1>
            <p className="text-muted-foreground text-lg">
              Select a test to measure your athletic performance with AI analysis
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Welcome Message */}
        <MotionCard delay={0.1} className="mb-8">
          <CardContent className="p-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-6xl mb-4">🏃‍♂️</div>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                Ready to showcase your talent?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered assessments analyze your performance in real-time, 
                providing detailed insights and connecting you with scouts and opportunities.
              </p>
            </motion.div>
          </CardContent>
        </MotionCard>

        {/* Test Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6 text-center">
            Available Assessments
          </h2>
          
          {testTypesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-12 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <TestSelection 
              testTypes={testTypes as any[]} 
              onTestSelect={handleTestSelect}
              showStartButton={false}
            />
          )}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MotionCard delay={0.4}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced computer vision analyzes your technique and performance metrics
              </p>
            </CardContent>
          </MotionCard>

          <MotionCard delay={0.5}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">Scout Visibility</h3>
              <p className="text-sm text-muted-foreground">
                Outstanding performances get noticed by verified sports scouts
              </p>
            </CardContent>
          </MotionCard>

          <MotionCard delay={0.6}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">Instant Results</h3>
              <p className="text-sm text-muted-foreground">
                Get detailed performance insights and improvement recommendations
              </p>
            </CardContent>
          </MotionCard>
        </div>
      </main>
    </div>
  );
}
