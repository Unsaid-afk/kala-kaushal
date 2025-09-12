import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Video, 
  Play, 
  Clock, 
  Calendar, 
  Trophy, 
  BarChart3,
  RefreshCw,
  PlayCircle,
  Maximize2
} from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { useState } from "react";

interface VideoGalleryProps {
  athleteId: string;
}

interface VideoData {
  id: string;
  testTypeId: string;
  createdAt: string;
  performanceScore: number;
  feedback: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  title: string;
}

export default function VideoGallery({ athleteId }: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  const { data: videos, isLoading, error, refetch, isFetching } = useQuery<VideoData[]>({
    queryKey: ["/api/athletes", athleteId, "videos"],
    enabled: !!athleteId,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card className="glow-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-heading font-bold text-foreground flex items-center">
            <Video className="w-5 h-5 mr-2 text-primary" />
            Assessment Videos
          </CardTitle>
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glow-border border-red-500/50">
        <CardContent className="p-6 text-center">
          <Video className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-heading font-bold text-foreground mb-2">
            Videos Unavailable
          </h3>
          <p className="text-muted-foreground mb-4">
            Unable to load assessment videos. Please try again later.
          </p>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            data-testid="button-retry-videos"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <Card className="glow-border">
        <CardContent className="p-6 text-center">
          <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-heading font-bold text-foreground mb-2">
            No Assessment Videos
          </h3>
          <p className="text-muted-foreground">
            This athlete hasn't completed any video assessments yet. Videos will appear here once assessments are submitted and analyzed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glow-border hover-glow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-heading font-bold text-foreground flex items-center">
            <Video className="w-5 h-5 mr-2 text-primary" />
            Assessment Videos ({videos.length})
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh-videos"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group"
              >
                <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden">
                  <div className="relative aspect-video bg-gradient-to-br from-background to-muted">
                    {/* Video Thumbnail */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <div className="text-center">
                        <PlayCircle className="w-12 h-12 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-muted-foreground">Assessment Video</span>
                      </div>
                    </div>
                    
                    {/* Performance Score Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className={`text-white ${getScoreColor(video.performanceScore)}`}>
                        {video.performanceScore.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-black/50 text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(video.duration)}
                      </Badge>
                    </div>
                    
                    {/* Play Overlay */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="absolute inset-0 bg-transparent hover:bg-black/20 border-none"
                          onClick={() => setSelectedVideo(video)}
                          data-testid={`button-play-video-${video.id}`}
                        >
                          <span className="sr-only">Play video {video.title}</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Video className="w-5 h-5 text-primary" />
                            {selectedVideo?.title}
                          </DialogTitle>
                        </DialogHeader>
                        
                        {selectedVideo && (
                          <div className="space-y-4">
                            {/* Video Player */}
                            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                              <div className="text-center text-white">
                                <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-sm opacity-70">Video player would be implemented here</p>
                                <p className="text-xs opacity-50 mt-2">Source: {selectedVideo.videoUrl}</p>
                              </div>
                            </div>
                            
                            {/* Video Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card className="bg-card/50">
                                <CardContent className="p-4">
                                  <h4 className="font-heading font-semibold mb-2 flex items-center">
                                    <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                                    Performance Score
                                  </h4>
                                  <div className="text-2xl font-bold text-primary">
                                    {selectedVideo.performanceScore.toFixed(1)}%
                                  </div>
                                </CardContent>
                              </Card>
                              
                              <Card className="bg-card/50">
                                <CardContent className="p-4">
                                  <h4 className="font-heading font-semibold mb-2 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-secondary" />
                                    Assessment Date
                                  </h4>
                                  <div className="text-sm text-muted-foreground">
                                    {format(parseISO(selectedVideo.createdAt), 'MMM dd, yyyy')}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                            
                            {/* AI Feedback */}
                            {selectedVideo.feedback && (
                              <Card className="bg-card/50">
                                <CardContent className="p-4">
                                  <h4 className="font-heading font-semibold mb-2 flex items-center">
                                    <Trophy className="w-4 h-4 mr-2 text-accent" />
                                    AI Analysis Feedback
                                  </h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {selectedVideo.feedback}
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {/* Video Info */}
                  <CardContent className="p-3">
                    <h4 className="font-heading font-semibold text-sm text-foreground mb-1" data-testid={`text-video-title-${video.id}`}>
                      {video.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(parseISO(video.createdAt), 'MMM dd')}
                      </span>
                      <span className="flex items-center">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        {video.performanceScore.toFixed(0)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-bold text-primary" data-testid="text-total-videos">
                {videos.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Videos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-secondary" data-testid="text-avg-score">
                {(videos.reduce((sum, v) => sum + v.performanceScore, 0) / videos.length).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent" data-testid="text-best-score">
                {Math.max(...videos.map(v => v.performanceScore)).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Best Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500" data-testid="text-total-duration">
                {formatDuration(videos.reduce((sum, v) => sum + v.duration, 0))}
              </div>
              <div className="text-xs text-muted-foreground">Total Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}