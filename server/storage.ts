import {
  users,
  athletes,
  assessments,
  testTypes,
  performanceMetrics,
  achievements,
  userAchievements,
  scoutViews,
  trainingPlans,
  kalaPradarshanVideos,
  type User,
  type UpsertUser,
  type Athlete,
  type InsertAthlete,
  type Assessment,
  type InsertAssessment,
  type TestType,
  type PerformanceMetric,
  type Achievement,
  type UserAchievement,
  type InsertKalaPradarshanVideo,
  type KalaPradarshanVideo,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Athlete operations
  getAthlete(userId: string): Promise<Athlete | undefined>;
  getAthleteById(id: string): Promise<Athlete | undefined>;
  createAthlete(athlete: InsertAthlete): Promise<Athlete>;
  updateAthlete(id: string, updates: Partial<InsertAthlete>): Promise<Athlete>;
  getAllAthletes(limit?: number, offset?: number): Promise<Athlete[]>;
  searchAthletes(query: string, sport?: string, location?: string): Promise<Athlete[]>;
  getTopAthletes(limit?: number): Promise<Athlete[]>;
  
  // Kala Pradarshan (Public Video Showcase) operations
  createKalaPradarshanVideo(videoData: InsertKalaPradarshanVideo): Promise<KalaPradarshanVideo>;
  getKalaPradarshanVideos(limit?: number, offset?: number, sport?: string): Promise<KalaPradarshanVideo[]>;
  getKalaPradarshanVideoById(id: string): Promise<KalaPradarshanVideo | undefined>;
  incrementVideoViews(id: string): Promise<void>;
  incrementVideoLikes(id: string): Promise<void>;
  getUserKalaPradarshanVideos(userId: string): Promise<KalaPradarshanVideo[]>;
  
  // File operations
  uploadFile(tempFilePath: string, targetPath: string): Promise<string>;
  
  // Assessment operations
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  getAthleteAssessments(athleteId: string): Promise<Assessment[]>;
  updateAssessmentStatus(id: string, status: string, results?: any): Promise<Assessment>;
  
  // Test type operations
  getAllTestTypes(): Promise<TestType[]>;
  getActiveTestTypes(): Promise<TestType[]>;
  
  // Performance metrics
  createPerformanceMetric(metric: Omit<PerformanceMetric, 'id' | 'createdAt'>): Promise<PerformanceMetric>;
  getAssessmentMetrics(assessmentId: string): Promise<PerformanceMetric[]>;
  
  // Achievements
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(athleteId: string): Promise<UserAchievement[]>;
  unlockAchievement(athleteId: string, achievementId: string): Promise<UserAchievement>;
  
  // Scout operations
  recordScoutView(scoutId: string, athleteId: string, duration?: number): Promise<void>;
  getScoutActivity(scoutId: string): Promise<any[]>;
  
  // Leaderboards
  getLeaderboard(sport?: string, metric?: string, limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations - required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Athlete operations
  async getAthlete(userId: string): Promise<Athlete | undefined> {
    const [athlete] = await db.select().from(athletes).where(eq(athletes.userId, userId));
    return athlete;
  }

  async getAthleteById(id: string): Promise<Athlete | undefined> {
    const [athlete] = await db.select().from(athletes).where(eq(athletes.id, id));
    return athlete;
  }

  async createAthlete(athlete: InsertAthlete): Promise<Athlete> {
    const [newAthlete] = await db.insert(athletes).values(athlete).returning();
    return newAthlete;
  }

  async updateAthlete(id: string, updates: Partial<InsertAthlete>): Promise<Athlete> {
    const [updated] = await db
      .update(athletes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(athletes.id, id))
      .returning();
    return updated;
  }

  async getAllAthletes(limit = 50, offset = 0): Promise<Athlete[]> {
    return db.select().from(athletes)
      .orderBy(desc(athletes.overallRating))
      .limit(limit)
      .offset(offset);
  }

  async searchAthletes(query: string, sport?: string, location?: string): Promise<Athlete[]> {
    let conditions = [];
    
    if (query) {
      conditions.push(
        sql`${athletes.userId} IN (
          SELECT id FROM ${users} 
          WHERE LOWER(first_name || ' ' || last_name) LIKE LOWER(${'%' + query + '%'})
        )`
      );
    }
    
    if (sport) {
      conditions.push(eq(athletes.primarySport, sport));
    }
    
    if (location) {
      conditions.push(eq(athletes.location, location));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return db.select().from(athletes)
      .where(whereClause)
      .orderBy(desc(athletes.overallRating))
      .limit(20);
  }

  async getTopAthletes(limit = 10): Promise<Athlete[]> {
    return db.select().from(athletes)
      .where(eq(athletes.isVerified, true))
      .orderBy(desc(athletes.overallRating))
      .limit(limit);
  }

  // Assessment operations
  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db.insert(assessments).values(assessment).returning();
    return newAssessment;
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment;
  }

  async getAthleteAssessments(athleteId: string): Promise<Assessment[]> {
    return db.select().from(assessments)
      .where(eq(assessments.athleteId, athleteId))
      .orderBy(desc(assessments.createdAt));
  }

  async updateAssessmentStatus(id: string, status: string, results?: any): Promise<Assessment> {
    const updates: any = { status, updatedAt: new Date() };
    if (results) {
      updates.aiAnalysisResults = results;
    }
    
    const [updated] = await db
      .update(assessments)
      .set(updates)
      .where(eq(assessments.id, id))
      .returning();
    return updated;
  }

  // Test type operations
  async getAllTestTypes(): Promise<TestType[]> {
    return db.select().from(testTypes).orderBy(testTypes.category, testTypes.name);
  }

  async getActiveTestTypes(): Promise<TestType[]> {
    return db.select().from(testTypes)
      .where(eq(testTypes.isActive, true))
      .orderBy(testTypes.category, testTypes.name);
  }

  // Performance metrics
  async createPerformanceMetric(metric: Omit<PerformanceMetric, 'id' | 'createdAt'>): Promise<PerformanceMetric> {
    const [newMetric] = await db.insert(performanceMetrics).values(metric).returning();
    return newMetric;
  }

  async getAssessmentMetrics(assessmentId: string): Promise<PerformanceMetric[]> {
    return db.select().from(performanceMetrics)
      .where(eq(performanceMetrics.assessmentId, assessmentId));
  }

  // Achievements
  async getAllAchievements(): Promise<Achievement[]> {
    return db.select().from(achievements)
      .where(eq(achievements.isActive, true))
      .orderBy(achievements.category, achievements.name);
  }

  async getUserAchievements(athleteId: string): Promise<UserAchievement[]> {
    return db.select().from(userAchievements)
      .where(eq(userAchievements.athleteId, athleteId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async unlockAchievement(athleteId: string, achievementId: string): Promise<UserAchievement> {
    const [newAchievement] = await db.insert(userAchievements)
      .values({ athleteId, achievementId })
      .returning();
    return newAchievement;
  }

  // Scout operations
  async recordScoutView(scoutId: string, athleteId: string, duration = 0): Promise<void> {
    await db.insert(scoutViews).values({
      scoutId,
      athleteId,
      duration,
    });
  }

  async getScoutActivity(scoutId: string): Promise<any[]> {
    return db.select({
      athleteId: scoutViews.athleteId,
      viewedAt: scoutViews.viewedAt,
      duration: scoutViews.duration,
    }).from(scoutViews)
      .where(eq(scoutViews.scoutId, scoutId))
      .orderBy(desc(scoutViews.viewedAt))
      .limit(50);
  }

  // Leaderboards
  async getLeaderboard(sport?: string, metric?: string, limit = 20): Promise<any[]> {
    // This is a complex query that would join multiple tables
    // For now, return top athletes by overall rating
    const baseQuery = db.select({
      athleteId: athletes.id,
      athleteName: sql`${users.firstName} || ' ' || ${users.lastName}`,
      sport: athletes.primarySport,
      location: athletes.location,
      rating: athletes.overallRating,
    }).from(athletes)
      .innerJoin(users, eq(athletes.userId, users.id));

    if (sport) {
      return baseQuery
        .where(eq(athletes.primarySport, sport))
        .orderBy(desc(athletes.overallRating))
        .limit(limit);
    }

    return baseQuery
      .orderBy(desc(athletes.overallRating))
      .limit(limit);
  }

  // Kala Pradarshan (Public Video Showcase) operations
  async createKalaPradarshanVideo(videoData: InsertKalaPradarshanVideo): Promise<KalaPradarshanVideo> {
    const [video] = await db.insert(kalaPradarshanVideos).values(videoData).returning();
    return video;
  }

  async getKalaPradarshanVideos(limit = 20, offset = 0, sport?: string): Promise<KalaPradarshanVideo[]> {
    const baseCondition = and(
      eq(kalaPradarshanVideos.isPublic, true),
      eq(kalaPradarshanVideos.isApproved, true)
    );

    const finalCondition = sport 
      ? and(baseCondition, eq(kalaPradarshanVideos.sport, sport))
      : baseCondition;

    return db.select().from(kalaPradarshanVideos)
      .where(finalCondition)
      .orderBy(desc(kalaPradarshanVideos.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getKalaPradarshanVideoById(id: string): Promise<KalaPradarshanVideo | undefined> {
    const [video] = await db.select().from(kalaPradarshanVideos).where(eq(kalaPradarshanVideos.id, id));
    return video;
  }

  async incrementVideoViews(id: string): Promise<void> {
    await db.update(kalaPradarshanVideos)
      .set({ views: sql`${kalaPradarshanVideos.views} + 1` })
      .where(eq(kalaPradarshanVideos.id, id));
  }

  async incrementVideoLikes(id: string): Promise<void> {
    await db.update(kalaPradarshanVideos)
      .set({ likes: sql`${kalaPradarshanVideos.likes} + 1` })
      .where(eq(kalaPradarshanVideos.id, id));
  }

  async getUserKalaPradarshanVideos(userId: string): Promise<KalaPradarshanVideo[]> {
    return db.select().from(kalaPradarshanVideos)
      .where(eq(kalaPradarshanVideos.userId, userId))
      .orderBy(desc(kalaPradarshanVideos.createdAt));
  }

  // File operations
  async uploadFile(tempFilePath: string, targetPath: string): Promise<string> {
    try {
      // Split path into directory and basename
      const pathParts = targetPath.split('/');
      const basename = pathParts.pop() || '';
      const directory = pathParts.join('/');
      
      // Critical security checks for directory
      if (path.isAbsolute(directory)) {
        throw new Error('Absolute paths not allowed');
      }
      if (directory.includes('..')) {
        throw new Error('Path traversal not allowed');
      }
      if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(directory)) {
        throw new Error('Invalid directory path');
      }
      
      // Sanitize only the basename
      const sanitizedBasename = basename.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 100);
      
      // Create secure paths
      const uploadsRoot = path.resolve('./uploads');
      const targetDir = path.resolve(uploadsRoot, directory);
      const finalPath = path.join(targetDir, sanitizedBasename);
      
      // CRITICAL: Ensure target is within uploads root
      if (!targetDir.startsWith(uploadsRoot + path.sep) && targetDir !== uploadsRoot) {
        throw new Error('Path escape attempt detected');
      }
      
      // Ensure the directory exists
      await fs.mkdir(targetDir, { recursive: true });
      
      // Move file (more efficient than read/write)
      await fs.rename(tempFilePath, finalPath);
      
      // Return the URL path for serving the file
      return `/uploads/${directory}/${sanitizedBasename}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }
}

export const storage = new DatabaseStorage();
