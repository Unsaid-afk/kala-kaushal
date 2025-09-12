import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Play, 
  Eye, 
  Heart, 
  Clock, 
  Trophy, 
  Filter,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  FileVideo,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getAllSportNames } from "@shared/constants";

interface KalaPradarshanVideo {
  id: string;
  userId: string;
  title: string;
  description: string;
  sport: string;
  videoUrl: string;
  tags: string[];
  views: number;
  likes: number;
  createdAt: string;
  metadata: {
    originalName: string;
    size: number;
    mimetype: string;
  };
}

export default function KalaPradarshan() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedVideo, setSelectedVideo] = useState<KalaPradarshanVideo | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    sport: '',
    tags: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const { data: videos, isLoading, error, refetch } = useQuery<KalaPradarshanVideo[]>({
    queryKey: ["/api/kala-pradarshan", selectedSport, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12"
      });
      if (selectedSport !== "all") {
        params.append("sport", selectedSport);
      }
      
      const response = await fetch(`/api/kala-pradarshan?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const handleVideoClick = async (video: KalaPradarshanVideo) => {
    setSelectedVideo(video);
    
    // Increment view count
    try {
      await fetch(`/api/kala-pradarshan/${video.id}/view`, {
        method: 'POST',
      });
      // Optionally refetch to update view count
      refetch();
    } catch (error) {
      console.error("Failed to increment view count:", error);
    }
  };

  const handleLikeVideo = async (videoId: string) => {
    try {
      await fetch(`/api/kala-pradarshan/${videoId}/like`, {
        method: 'POST',
      });
      refetch();
      toast({
        title: "Video liked!",
        description: "Thank you for your support",
      });
    } catch (error) {
      console.error("Failed to like video:", error);
      toast({
        title: "Error",
        description: "Failed to like video",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Upload form handlers
  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      'video/mp4', 
      'video/quicktime', 
      'video/x-msvideo', 
      'video/webm', 
      'video/x-matroska',
      'application/octet-stream' // fallback for some browsers
    ];
    const allowedExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    // Check file type or extension if type is not available
    const isValidType = allowedTypes.includes(file.type) || 
      allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      return 'Please select a valid video file (MP4, MOV, AVI, WebM, MKV)';
    }
    
    if (file.size > maxSize) {
      return 'File size must be less than 50MB';
    }
    
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast({
        title: "File Error",
        description: error,
        variant: "destructive",
      });
      return;
    }
    
    setUploadFile(file);
    if (!uploadForm.title) {
      // Auto-populate title from filename
      const fileName = file.name.split('.')[0];
      setUploadForm(prev => ({ ...prev, title: fileName }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile || !uploadForm.title || !uploadForm.description || !uploadForm.sport) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a video file",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('video', uploadFile);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('sport', uploadForm.sport);
      
      if (uploadForm.tags.trim()) {
        formData.append('tags', uploadForm.tags);
      }
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      xhr.onload = () => {
        setIsUploading(false);
        setUploadProgress(0);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          toast({
            title: "Success!",
            description: "Your video has been uploaded successfully",
          });
          
          // Reset form
          setUploadFile(null);
          setUploadForm({ title: '', description: '', sport: '', tags: '' });
          setShowUploadDialog(false);
          refetch(); // Refresh videos list
        } else {
          let errorMessage = 'Upload failed';
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If response isn't valid JSON, use default message
          }
          
          toast({
            title: "Upload Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      };
      
      xhr.onerror = () => {
        setIsUploading(false);
        setUploadProgress(0);
        
        toast({
          title: "Network Error",
          description: "A network error occurred during upload. Please check your connection and try again.",
          variant: "destructive",
        });
      };
      
      xhr.onabort = () => {
        setIsUploading(false);
        setUploadProgress(0);
        
        toast({
          title: "Upload Cancelled",
          description: "The upload was cancelled",
          variant: "destructive",
        });
      };
      
      xhr.open('POST', '/api/kala-pradarshan');
      xhr.send(formData);
      
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadForm({ title: '', description: '', sport: '', tags: '' });
    setUploadProgress(0);
    setIsUploading(false);
    setDragActive(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-12 w-96 mb-4" />
            <Skeleton className="h-6 w-64" />
          </div>
          
          {/* Filters Skeleton */}
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          {/* Videos Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-red-500/50">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-heading font-bold text-foreground mb-2">
              Unable to Load Videos
            </h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading the sports showcase. Please try again later.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 border-b border-border/50 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-primary">
                🎭 कला प्रदर्शन
              </h1>
              <p className="text-muted-foreground mt-1">
                Sports Talent Showcase - Share & Discover Amazing Sports Skills
              </p>
            </div>
            
            {isAuthenticated && (
              <Button 
                onClick={() => setShowUploadDialog(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Share Video
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {getAllSportNames().map((sport: string) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground flex items-center">
            {videos?.length || 0} videos found
          </div>
        </div>

        {/* Videos Grid */}
        {!videos || videos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                No Videos Found
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedSport === "all" 
                  ? "Be the first to share your sports talent!" 
                  : `No videos found for ${selectedSport}. Try a different sport or be the first to share!`
                }
              </p>
              {isAuthenticated && (
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload First Video
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 glow-border hover-glow"
                  onClick={() => handleVideoClick(video)}
                >
                  <CardHeader className="p-0">
                    <div className="relative aspect-video bg-muted/50 rounded-t-lg overflow-hidden">
                      {/* Video Thumbnail */}
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      {/* Sport Badge */}
                      <Badge className="absolute top-2 left-2 bg-black/70 text-white">
                        {video.sport}
                      </Badge>
                      
                      {/* Duration Badge */}
                      <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        Video
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {video.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {video.likes}
                        </span>
                      </div>
                      <span>{formatDate(video.createdAt)}</span>
                    </div>
                    
                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {video.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                        {video.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            +{video.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {videos && videos.length > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {page}
            </span>
            <Button 
              variant="outline" 
              onClick={() => setPage(p => p + 1)}
              disabled={!videos || videos.length < 12}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>

      {/* Video Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-bold">
              {selectedVideo?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="space-y-4">
              {/* Video Player Placeholder */}
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-70" />
                  <p className="text-lg font-semibold mb-2">Sports Video</p>
                  <p className="text-sm opacity-70">
                    File: {selectedVideo.metadata?.originalName || 'video.mp4'}
                  </p>
                  <p className="text-xs opacity-50">
                    Size: {formatFileSize(selectedVideo.metadata?.size || 0)}
                  </p>
                </div>
              </div>
              
              {/* Video Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{selectedVideo.title}</h3>
                  <p className="text-muted-foreground">{selectedVideo.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge>{selectedVideo.sport}</Badge>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {selectedVideo.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {selectedVideo.likes} likes
                  </span>
                  <span>{formatDate(selectedVideo.createdAt)}</span>
                </div>
                
                {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedVideo.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => handleLikeVideo(selectedVideo.id)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                  <Button 
                    onClick={() => setSelectedVideo(null)}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog 
        open={showUploadDialog} 
        onOpenChange={(open) => {
          if (!open && !isUploading) {
            resetUploadForm();
          }
          setShowUploadDialog(open);
        }}
      >
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Share Your Sports Video
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div className="space-y-2">
              <Label htmlFor="video-upload">Video File *</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : uploadFile 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                    : 'border-border hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('video-upload')?.click()}
              >
                {uploadFile ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                    <p className="font-medium text-green-700 dark:text-green-400">
                      {uploadFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadFile.size)} • {uploadFile.type}
                    </p>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadFile(null);
                      }}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileVideo className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-lg font-medium">
                      Drop your video here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      MP4, MOV, AVI, WebM • Max 50MB
                    </p>
                  </div>
                )}
                
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter video title..."
                  disabled={isUploading}
                  maxLength={100}
                />
              </div>

              {/* Sport Selection */}
              <div className="space-y-2">
                <Label htmlFor="sport">Sport *</Label>
                <Select 
                  value={uploadForm.sport} 
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, sport: value }))}
                  disabled={isUploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllSportNames().map((sport: string) => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="skill, technique, training..."
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  Separate tags with commas
                </p>
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your sports performance, technique, or achievement..."
                  disabled={isUploading}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {uploadForm.description.length}/500
                </p>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!isUploading) {
                    resetUploadForm();
                    setShowUploadDialog(false);
                  }
                }}
                disabled={isUploading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!uploadFile || !uploadForm.title || !uploadForm.description || !uploadForm.sport || isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Video
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}