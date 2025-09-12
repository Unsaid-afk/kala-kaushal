import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { videoAnalysisService } from "./services/openai";
import { insertAthleteSchema, insertAssessmentSchema, insertKalaPradarshanVideoSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

// Function to sanitize filename
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Keep only alphanumeric, dots, and hyphens
    .replace(/_{2,}/g, '_') // Collapse multiple underscores
    .substring(0, 100); // Limit length
}

// Function to ensure upload directory exists
async function ensureUploadDir() {
  await fs.mkdir('./uploads/tmp', { recursive: true });
}

// Configure multer for video uploads with disk storage for safety
const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Fix error handling with proper callback usage
      ensureUploadDir()
        .then(() => cb(null, './uploads/tmp'))
        .catch(err => cb(err));
    },
    filename: (req, file, cb) => {
      const sanitizedName = sanitizeFilename(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${sanitizedName}`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static('uploads'));
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get athlete profile if user is an athlete
      let athlete = null;
      if (user.role === 'athlete') {
        athlete = await storage.getAthlete(userId);
      }
      
      res.json({ ...user, athlete });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Athlete profile routes
  app.post('/api/athletes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const athleteData = insertAthleteSchema.parse({ ...req.body, userId });
      
      const athlete = await storage.createAthlete(athleteData);
      res.json(athlete);
    } catch (error) {
      console.error("Error creating athlete profile:", error);
      res.status(400).json({ message: "Failed to create athlete profile" });
    }
  });

  app.get('/api/athletes/:id', isAuthenticated, async (req, res) => {
    try {
      const athlete = await storage.getAthleteById(req.params.id);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      // Record scout view if user is a scout
      const user = req.user as any;
      if (user.claims && user.claims.sub) {
        const currentUser = await storage.getUser(user.claims.sub);
        if (currentUser?.role === 'scout') {
          await storage.recordScoutView(user.claims.sub, athlete.id);
        }
      }
      
      res.json(athlete);
    } catch (error) {
      console.error("Error fetching athlete:", error);
      res.status(500).json({ message: "Failed to fetch athlete" });
    }
  });

  app.get('/api/athletes', async (req, res) => {
    try {
      const { search, sport, location, limit = '20', offset = '0' } = req.query;
      
      let athletes;
      if (search || sport || location) {
        athletes = await storage.searchAthletes(
          search as string,
          sport as string,
          location as string
        );
      } else {
        athletes = await storage.getAllAthletes(
          parseInt(limit as string),
          parseInt(offset as string)
        );
      }
      
      res.json(athletes);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      res.status(500).json({ message: "Failed to fetch athletes" });
    }
  });

  app.get('/api/athletes/top/:limit?', async (req, res) => {
    try {
      const limit = parseInt(req.params.limit || '10');
      const topAthletes = await storage.getTopAthletes(limit);
      res.json(topAthletes);
    } catch (error) {
      console.error("Error fetching top athletes:", error);
      res.status(500).json({ message: "Failed to fetch top athletes" });
    }
  });

  // Assessment routes
  app.get('/api/test-types', async (req, res) => {
    try {
      const testTypes = await storage.getActiveTestTypes();
      res.json(testTypes);
    } catch (error) {
      console.error("Error fetching test types:", error);
      res.status(500).json({ message: "Failed to fetch test types" });
    }
  });

  app.post('/api/assessments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const athlete = await storage.getAthlete(userId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete profile not found" });
      }

      const assessmentData = insertAssessmentSchema.parse({
        ...req.body,
        athleteId: athlete.id
      });
      
      const assessment = await storage.createAssessment(assessmentData);
      res.json(assessment);
    } catch (error) {
      console.error("Error creating assessment:", error);
      res.status(400).json({ message: "Failed to create assessment" });
    }
  });

  app.get('/api/assessments/:id', isAuthenticated, async (req, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      // Get associated metrics
      const metrics = await storage.getAssessmentMetrics(assessment.id);
      
      res.json({ ...assessment, metrics });
    } catch (error) {
      console.error("Error fetching assessment:", error);
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  app.get('/api/athletes/:athleteId/assessments', isAuthenticated, async (req, res) => {
    try {
      const assessments = await storage.getAthleteAssessments(req.params.athleteId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching athlete assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  // AI Insights endpoint
  app.get('/api/athletes/:id/ai-insights', isAuthenticated, async (req, res) => {
    try {
      const athleteId = req.params.id;
      const athlete = await storage.getAthleteById(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }

      // Get athlete assessments and metrics
      const assessments = await storage.getAthleteAssessments(athleteId);
      const completedAssessments = assessments.filter(a => a.status === 'completed');
      
      // Get performance metrics for all completed assessments
      const allMetrics = [];
      for (const assessment of completedAssessments) {
        const metrics = await storage.getAssessmentMetrics(assessment.id);
        allMetrics.push(...metrics);
      }

      // Generate AI insights
      const insights = await videoAnalysisService.generateAthleteInsights(
        athlete,
        completedAssessments,
        allMetrics
      );

      res.json(insights);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });

  // Video gallery endpoint
  app.get('/api/athletes/:id/videos', isAuthenticated, async (req, res) => {
    try {
      const athleteId = req.params.id;
      const athlete = await storage.getAthleteById(athleteId);
      
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }

      // Get assessments with videos (those that have been completed with AI analysis)
      const assessments = await storage.getAthleteAssessments(athleteId);
      const videosData = assessments
        .filter(a => a.status === 'completed' && a.aiAnalysisResults)
        .map(assessment => ({
          id: assessment.id,
          testTypeId: assessment.testTypeId,
          createdAt: assessment.createdAt,
          performanceScore: assessment.aiAnalysisResults?.performanceScore || 0,
          feedback: assessment.aiAnalysisResults?.feedback || '',
          // Note: In a real app, you'd store video URLs or file paths
          // For now, we'll use placeholder data
          thumbnailUrl: `/api/assessments/${assessment.id}/thumbnail`,
          videoUrl: `/api/assessments/${assessment.id}/video`,
          duration: assessment.aiAnalysisResults?.videoDuration || 30,
          title: `Assessment ${assessment.id.slice(0, 8)}`,
        }));

      res.json(videosData);
    } catch (error) {
      console.error("Error fetching athlete videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Video upload and analysis
  app.post('/api/assessments/:id/upload-video', 
    isAuthenticated, 
    upload.single('video'), 
    async (req: any, res) => {
      try {
        const assessmentId = req.params.id;
        const assessment = await storage.getAssessment(assessmentId);
        
        if (!assessment) {
          return res.status(404).json({ message: "Assessment not found" });
        }

        if (!req.file) {
          return res.status(400).json({ message: "No video file provided" });
        }

        // Update assessment status to processing
        await storage.updateAssessmentStatus(assessmentId, 'processing');

        // Convert video to base64 for OpenAI analysis
        const base64Video = req.file.buffer.toString('base64');
        
        // Get test type info
        const testTypes = await storage.getAllTestTypes();
        const testType = testTypes.find(t => t.id === assessment.testTypeId);
        
        // Get athlete info for context
        const athlete = await storage.getAthleteById(assessment.athleteId);
        
        try {
          // Validate video integrity
          const integrity = await videoAnalysisService.validateVideoIntegrity(base64Video);
          
          if (!integrity.isValid) {
            await storage.updateAssessmentStatus(assessmentId, 'failed', {
              error: 'Video integrity validation failed',
              issues: integrity.issues
            });
            return res.status(400).json({ 
              message: "Video validation failed", 
              issues: integrity.issues 
            });
          }

          // Analyze video performance
          const analysisResult = await videoAnalysisService.analyzePerformanceVideo(
            base64Video,
            testType?.name || 'general',
            {
              age: athlete?.age || undefined,
              height: athlete?.height ? parseFloat(athlete.height) : undefined,
              weight: athlete?.weight ? parseFloat(athlete.weight) : undefined,
              sport: athlete?.primarySport || undefined
            }
          );

          // Calculate overall performance score
          const performanceScore = analysisResult.performanceScore;

          // Store analysis results
          await storage.updateAssessmentStatus(assessmentId, 'completed', {
            ...analysisResult,
            integrity: integrity
          });

          // Create performance metrics
          for (const metric of analysisResult.metrics) {
            await storage.createPerformanceMetric({
              assessmentId,
              metricName: metric.name,
              value: metric.value.toString(),
              unit: metric.unit,
              percentile: null,
              confidence: metric.confidence.toString()
            });
          }

          res.json({
            message: "Video analyzed successfully",
            assessment: await storage.getAssessment(assessmentId),
            analysisResult
          });

        } catch (analysisError) {
          console.error("AI analysis failed:", analysisError);
          await storage.updateAssessmentStatus(assessmentId, 'failed', {
            error: 'AI analysis failed',
            details: (analysisError as Error).message
          });
          
          res.status(500).json({ 
            message: "Video analysis failed", 
            error: (analysisError as Error).message 
          });
        }

      } catch (error) {
        console.error("Video upload error:", error);
        res.status(500).json({ message: "Failed to process video upload" });
      }
    }
  );

  // Leaderboard routes
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const { sport, metric, limit = '20' } = req.query;
      const leaderboard = await storage.getLeaderboard(
        sport as string,
        metric as string,
        parseInt(limit as string)
      );
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Achievement routes
  app.get('/api/achievements', async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get('/api/athletes/:athleteId/achievements', async (req, res) => {
    try {
      const userAchievements = await storage.getUserAchievements(req.params.athleteId);
      res.json(userAchievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // Scout dashboard routes
  app.get('/api/scout/activity', isAuthenticated, async (req: any, res) => {
    try {
      const scoutId = req.user.claims.sub;
      const activity = await storage.getScoutActivity(scoutId);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching scout activity:", error);
      res.status(500).json({ message: "Failed to fetch scout activity" });
    }
  });

  // Dashboard statistics
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      // This would typically involve complex aggregation queries
      // For now, return some basic stats
      const stats = {
        totalAthletes: 12847,
        totalAssessments: 8932,
        topPerformers: 1203,
        scoutViews: 24567,
        // These would be calculated from actual data
        growthStats: {
          athletes: '+12%',
          assessments: '+18%',
          performers: '+8%',
          views: '+25%'
        }
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Kala Pradarshan (Public Video Showcase) routes
  
  // Get all public videos with optional sport filter
  app.get('/api/kala-pradarshan', async (req, res) => {
    try {
      const { sport, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const videos = await storage.getKalaPradarshanVideos(
        Number(limit), 
        offset, 
        sport as string
      );
      
      res.json(videos);
    } catch (error) {
      console.error("Error fetching Kala Pradarshan videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Upload a new public video
  app.post('/api/kala-pradarshan', isAuthenticated, upload.single('video'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, description, sport, tags } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: "Video file is required" });
      }

      // With disk storage, file is already saved; move it to final location
      // SECURITY: Server-derived path, not client-controlled
      const timestamp = Date.now();
      const finalFileName = `kala-pradarshan/${userId}/${timestamp}-video`;
      const videoUrl = await storage.uploadFile(req.file.path, finalFileName);
      
      const videoData = insertKalaPradarshanVideoSchema.parse({
        userId,
        title,
        description,
        sport,
        videoUrl,
        tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        metadata: {
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        }
      });
      
      const video = await storage.createKalaPradarshanVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error("Error uploading Kala Pradarshan video:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  // Get a specific video
  app.get('/api/kala-pradarshan/:id', async (req, res) => {
    try {
      const video = await storage.getKalaPradarshanVideoById(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // Increment video views
  app.post('/api/kala-pradarshan/:id/view', async (req, res) => {
    try {
      await storage.incrementVideoViews(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing views:", error);
      res.status(500).json({ message: "Failed to update views" });
    }
  });

  // Like a video
  app.post('/api/kala-pradarshan/:id/like', isAuthenticated, async (req, res) => {
    try {
      await storage.incrementVideoLikes(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking video:", error);
      res.status(500).json({ message: "Failed to like video" });
    }
  });

  // Get user's own videos
  app.get('/api/users/kala-pradarshan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videos = await storage.getUserKalaPradarshanVideos(userId);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching user videos:", error);
      res.status(500).json({ message: "Failed to fetch user videos" });
    }
  });

  // Training recommendations
  app.post('/api/athletes/:athleteId/training-recommendations', isAuthenticated, async (req, res) => {
    try {
      const athleteId = req.params.athleteId;
      const { goals } = req.body;
      
      const athlete = await storage.getAthleteById(athleteId);
      if (!athlete) {
        return res.status(404).json({ message: "Athlete not found" });
      }
      
      const recentAssessments = await storage.getAthleteAssessments(athleteId);
      
      const recommendations = await videoAnalysisService.generateTrainingRecommendations(
        athlete,
        recentAssessments.slice(0, 5), // Last 5 assessments
        goals || []
      );
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating training recommendations:", error);
      res.status(500).json({ message: "Failed to generate training recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
