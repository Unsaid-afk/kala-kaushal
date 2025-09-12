import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("athlete"), // athlete, scout, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Athlete profiles with detailed information
export const athletes = pgTable("athletes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  age: integer("age"),
  height: decimal("height", { precision: 5, scale: 2 }), // in cm
  weight: decimal("weight", { precision: 5, scale: 2 }), // in kg
  location: varchar("location"),
  state: varchar("state"),
  primarySport: varchar("primary_sport"),
  secondarySports: text("secondary_sports").array(),
  preferredLanguage: varchar("preferred_language").default("en"),
  bio: text("bio"),
  achievements: text("achievements").array(),
  isVerified: boolean("is_verified").default(false),
  overallRating: decimal("overall_rating", { precision: 3, scale: 1 }).default("0.0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Test types available in the platform
export const testTypes = pgTable("test_types", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // speed, agility, strength, endurance
  instructions: text("instructions"),
  equipmentRequired: text("equipment_required").array(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  difficultyLevel: varchar("difficulty_level"), // beginner, intermediate, advanced
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual assessment sessions
export const assessments = pgTable("assessments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id),
  testTypeId: uuid("test_type_id").notNull().references(() => testTypes.id),
  videoUrl: varchar("video_url"),
  status: varchar("status").notNull().default("pending"), // pending, processing, completed, failed
  aiAnalysisResults: jsonb("ai_analysis_results"),
  performanceScore: decimal("performance_score", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  duration: integer("duration"), // in seconds
  metadata: jsonb("metadata"), // additional data like device info, conditions
  isVerified: boolean("is_verified").default(false),
  verifiedBy: varchar("verified_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Detailed performance metrics for each assessment
export const performanceMetrics = pgTable("performance_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: uuid("assessment_id").notNull().references(() => assessments.id),
  metricName: varchar("metric_name").notNull(), // speed, jump_height, form_score, etc.
  value: decimal("value", { precision: 10, scale: 4 }).notNull(),
  unit: varchar("unit"), // m/s, cm, degrees, percentage
  percentile: decimal("percentile", { precision: 5, scale: 2 }), // compared to age group
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // AI confidence score
  createdAt: timestamp("created_at").defaultNow(),
});

// Achievement badges and milestones
export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  category: varchar("category"), // performance, consistency, milestone
  criteria: jsonb("criteria"), // conditions to unlock
  rarity: varchar("rarity").default("common"), // common, rare, epic, legendary
  points: integer("points").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements tracking
export const userAchievements = pgTable("user_achievements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id),
  achievementId: uuid("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("100.0"), // if partially completed
});

// Scout views and interactions
export const scoutViews = pgTable("scout_views", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  scoutId: varchar("scout_id").notNull().references(() => users.id),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id),
  viewedAt: timestamp("viewed_at").defaultNow(),
  duration: integer("duration"), // time spent viewing profile
  interactions: jsonb("interactions"), // bookmarks, notes, ratings
});

// Training plans and recommendations
export const trainingPlans = pgTable("training_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id),
  name: varchar("name").notNull(),
  description: text("description"),
  goals: text("goals").array(),
  duration: integer("duration"), // in weeks
  exercises: jsonb("exercises"),
  aiGenerated: boolean("ai_generated").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Kala Pradarshan - Public video showcase
export const kalaPradarshanVideos = pgTable("kala_pradarshan_videos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  sport: varchar("sport").notNull(),
  videoUrl: varchar("video_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  duration: integer("duration"), // in seconds
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  isPublic: boolean("is_public").default(true),
  isApproved: boolean("is_approved").default(true), // for moderation
  metadata: jsonb("metadata"), // additional video info
  tags: text("tags").array(), // for search/filtering
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  athlete: one(athletes, {
    fields: [users.id],
    references: [athletes.userId],
  }),
  scoutViews: many(scoutViews),
  kalaPradarshanVideos: many(kalaPradarshanVideos),
}));

export const athletesRelations = relations(athletes, ({ one, many }) => ({
  user: one(users, {
    fields: [athletes.userId],
    references: [users.id],
  }),
  assessments: many(assessments),
  achievements: many(userAchievements),
  scoutViews: many(scoutViews),
  trainingPlans: many(trainingPlans),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  athlete: one(athletes, {
    fields: [assessments.athleteId],
    references: [athletes.id],
  }),
  testType: one(testTypes, {
    fields: [assessments.testTypeId],
    references: [testTypes.id],
  }),
  metrics: many(performanceMetrics),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  assessment: one(assessments, {
    fields: [performanceMetrics.assessmentId],
    references: [assessments.id],
  }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  athlete: one(athletes, {
    fields: [userAchievements.athleteId],
    references: [athletes.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const scoutViewsRelations = relations(scoutViews, ({ one }) => ({
  scout: one(users, {
    fields: [scoutViews.scoutId],
    references: [users.id],
  }),
  athlete: one(athletes, {
    fields: [scoutViews.athleteId],
    references: [athletes.id],
  }),
}));

export const trainingPlansRelations = relations(trainingPlans, ({ one }) => ({
  athlete: one(athletes, {
    fields: [trainingPlans.athleteId],
    references: [athletes.id],
  }),
}));

export const kalaPradarshanVideosRelations = relations(kalaPradarshanVideos, ({ one }) => ({
  user: one(users, {
    fields: [kalaPradarshanVideos.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertAthleteSchema = createInsertSchema(athletes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  overallRating: true,
  isVerified: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  isVerified: true,
  verifiedBy: true,
});

export const insertTestTypeSchema = createInsertSchema(testTypes).omit({
  id: true,
  createdAt: true,
  isActive: true,
});

export const insertKalaPradarshanVideoSchema = createInsertSchema(kalaPradarshanVideos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
  likes: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAthlete = z.infer<typeof insertAthleteSchema>;
export type Athlete = typeof athletes.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;
export type TestType = typeof testTypes.$inferSelect;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type ScoutView = typeof scoutViews.$inferSelect;
export type TrainingPlan = typeof trainingPlans.$inferSelect;
export type InsertKalaPradarshanVideo = z.infer<typeof insertKalaPradarshanVideoSchema>;
export type KalaPradarshanVideo = typeof kalaPradarshanVideos.$inferSelect;
