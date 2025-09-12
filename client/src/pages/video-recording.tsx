import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import VideoRecorder from "@/components/video-recorder";
import MotionCard from "@/components/ui/motion-card";
import GlowingButton from "@/components/ui/glowing-button";
import { 
  ArrowLeft,
  Camera,
  Play,
  Square,
  RotateCcw,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type RecordingState = 'setup' | 'countdown' | 'recording' | 'recorded' | 'uploading' | 'processing' | 'completed';

export default function VideoRecording() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [recordingState, setRecordingState] = useState<RecordingState>('setup');
  const [countdown, setCountdown] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  // Get assessment data
  const { data: assessment, isLoading: assessmentLoading, error } = useQuery({
    queryKey: ["/api/assessments", id],
    enabled: !!id && isAuthenticated,
    retry: false,
  });

  // Upload video mutation
  const uploadVideoMutation = useMutation({
    mutationFn: async (videoBlob: Blob) => {
      const formData = new FormData();
      formData.append('video', videoBlob, 'assessment.mp4');
      
      const response = await fetch(`/api/assessments/${id}/upload-video`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      setRecordingState('completed');
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", id] });
      toast({
        title: "Video Analyzed!",
        description: "Your assessment has been processed successfully.",
      });
      
      // Redirect to results after a delay
      setTimeout(() => {
        window.location.href = `/results/${id}`;
      }, 2000);
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
      
      setRecordingState('recorded');
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    },
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

  const startCountdown = () => {
    setRecordingState('countdown');
    setCountdown(3);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRecordingState('recording');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
    setRecordingState('recorded');
  };

  const handleUpload = () => {
    if (recordedBlob) {
      setRecordingState('uploading');
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressTimer);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 200);
      
      uploadVideoMutation.mutate(recordedBlob);
    }
  };

  const handleRetake = () => {
    setRecordedBlob(null);
    setRecordingState('setup');
    setUploadProgress(0);
  };

  if (isLoading || assessmentLoading) {
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

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold text-foreground mb-2">
              Assessment Not Found
            </h2>
            <p className="text-muted-foreground mb-4">
              The assessment you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4 text-muted-foreground hover:text-foreground"
            disabled={recordingState === 'recording' || recordingState === 'uploading'}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                Video Assessment
              </h1>
              <p className="text-muted-foreground">
                Record your performance for AI analysis
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        
        {/* Status Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {['setup', 'countdown', 'recording', 'recorded', 'uploading', 'completed'].map((state, index) => (
              <div
                key={state}
                className={`w-3 h-3 rounded-full transition-colors ${
                  recordingState === state 
                    ? 'bg-primary animate-glow' 
                    : index < ['setup', 'countdown', 'recording', 'recorded', 'uploading', 'completed'].indexOf(recordingState)
                    ? 'bg-accent'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {recordingState === 'setup' && 'Position camera and prepare to record'}
            {recordingState === 'countdown' && 'Get ready...'}
            {recordingState === 'recording' && 'Recording in progress'}
            {recordingState === 'recorded' && 'Recording complete - review and upload'}
            {recordingState === 'uploading' && 'Uploading video for analysis'}
            {recordingState === 'processing' && 'AI analyzing your performance'}
            {recordingState === 'completed' && 'Analysis complete!'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Recording Area */}
          <div className="lg:col-span-2">
            <MotionCard delay={0.1}>
              <CardContent className="p-6">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {/* Countdown Overlay */}
                  <AnimatePresence>
                    {recordingState === 'countdown' && countdown > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"
                      >
                        <div className="text-8xl font-bold text-primary animate-glow">
                          {countdown}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Recording Indicator */}
                  {recordingState === 'recording' && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-full z-10">
                      <div className="w-3 h-3 bg-destructive-foreground rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">REC</span>
                    </div>
                  )}

                  {/* Video Recorder Component */}
                  <VideoRecorder
                    isRecording={recordingState === 'recording'}
                    onRecordingComplete={handleRecordingComplete}
                    recordedBlob={recordedBlob}
                  />

                  {/* Skeleton Guide Overlay */}
                  {recordingState === 'setup' && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="skeleton-overlay animate-pulse" />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm">
                        Position yourself within the guide
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex justify-center mt-6 space-x-4">
                  {recordingState === 'setup' && (
                    <GlowingButton 
                      onClick={startCountdown}
                      size="lg"
                      data-testid="button-start-recording"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Recording
                    </GlowingButton>
                  )}

                  {recordingState === 'recorded' && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={handleRetake}
                        data-testid="button-retake"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retake
                      </Button>
                      <GlowingButton 
                        onClick={handleUpload}
                        data-testid="button-upload"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload & Analyze
                      </GlowingButton>
                    </>
                  )}

                  {recordingState === 'uploading' && (
                    <div className="w-full max-w-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          Uploading & Analyzing...
                        </span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1 text-center">
                        {uploadProgress.toFixed(0)}% complete
                      </p>
                    </div>
                  )}

                  {recordingState === 'completed' && (
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-accent mx-auto mb-2" />
                      <p className="text-foreground font-medium">Analysis Complete!</p>
                      <p className="text-sm text-muted-foreground">Redirecting to results...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </MotionCard>
          </div>

          {/* Instructions Sidebar */}
          <div className="space-y-6">
            <MotionCard delay={0.2}>
              <CardHeader>
                <CardTitle className="text-lg font-heading font-bold">Recording Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">1</span>
                  </div>
                  <p className="text-muted-foreground">
                    Position yourself within the skeleton guide outline
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">2</span>
                  </div>
                  <p className="text-muted-foreground">
                    Ensure good lighting and stable camera position
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">3</span>
                  </div>
                  <p className="text-muted-foreground">
                    Follow the countdown and perform your best
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">4</span>
                  </div>
                  <p className="text-muted-foreground">
                    Recording will stop automatically after the test duration
                  </p>
                </div>
              </CardContent>
            </MotionCard>

            <MotionCard delay={0.3}>
              <CardHeader>
                <CardTitle className="text-lg font-heading font-bold">What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-secondary" />
                  <span className="text-muted-foreground">Video uploaded securely</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">AI analyzes your performance</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span className="text-muted-foreground">Detailed results generated</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span className="text-muted-foreground">Typical analysis: 30-60 seconds</span>
                </div>
              </CardContent>
            </MotionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
