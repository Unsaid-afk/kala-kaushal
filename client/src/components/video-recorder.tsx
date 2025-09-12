import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw } from "lucide-react";

interface VideoRecorderProps {
  isRecording: boolean;
  onRecordingComplete: (blob: Blob) => void;
  recordedBlob?: Blob | null;
  maxDuration?: number; // in seconds
}

export default function VideoRecorder({ 
  isRecording, 
  onRecordingComplete, 
  recordedBlob,
  maxDuration = 30 
}: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: true
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        setHasCamera(true);
        setCameraError(null);
      } catch (error) {
        console.error("Camera access error:", error);
        setCameraError("Camera access denied. Please allow camera permissions and reload the page.");
        setHasCamera(false);
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording, maxDuration]);

  // Start recording when isRecording becomes true
  useEffect(() => {
    if (isRecording && streamRef.current && !mediaRecorderRef.current) {
      startRecording();
    } else if (!isRecording && mediaRecorderRef.current) {
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm'
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        onRecordingComplete(blob);
        mediaRecorderRef.current = null;
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error("Recording start error:", error);
      setCameraError("Failed to start recording. Please try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (cameraError) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-6xl mb-4">📹</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Camera Access Required</h3>
          <p className="text-sm text-muted-foreground mb-4">{cameraError}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            data-testid="button-reload-camera"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry Camera Access
          </Button>
        </div>
      </div>
    );
  }

  if (!hasCamera) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-muted-foreground">Initializing camera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`w-full h-full object-cover ${recordedBlob ? 'hidden' : ''}`}
      />

      {/* Recorded Video Playback */}
      {recordedBlob && (
        <video
          src={URL.createObjectURL(recordedBlob)}
          controls
          className="w-full h-full object-cover"
          data-testid="recorded-video"
        />
      )}

      {/* Recording Timer */}
      {isRecording && (
        <div className="absolute top-4 left-4 bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse"></div>
            {formatTime(recordingTime)} / {formatTime(maxDuration)}
          </div>
        </div>
      )}

      {/* Recording Guide Overlay */}
      {!isRecording && !recordedBlob && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="recording-overlay"></div>
          <div className="skeleton-overlay"></div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
            Position yourself within the guide
          </div>
        </div>
      )}

      {/* Recording Progress Bar */}
      {isRecording && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
          <div 
            className="h-full bg-destructive transition-all duration-1000"
            style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
