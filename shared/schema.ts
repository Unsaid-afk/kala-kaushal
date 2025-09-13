import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role', { enum: ['athlete', 'scout', 'coach', 'admin'] }).notNull(),
  avatar: text('avatar'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const assessments = sqliteTable('assessments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type', { enum: ['video', 'performance', 'skill'] }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['pending', 'in_progress', 'completed', 'failed'] }).notNull(),
  score: real('score'),
  feedback: text('feedback'),
  videoUrl: text('video_url'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
})

export const videos = sqliteTable('videos', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  assessmentId: text('assessment_id').references(() => assessments.id),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  duration: real('duration'),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const aiInsights = sqliteTable('ai_insights', {
  id: text('id').primaryKey(),
  assessmentId: text('assessment_id').notNull().references(() => assessments.id),
  type: text('type', { enum: ['performance', 'technique', 'improvement'] }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  score: real('score'),
  confidence: real('confidence'),
  recommendations: text('recommendations', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const leaderboard = sqliteTable('leaderboard', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  category: text('category').notNull(),
  score: real('score').notNull(),
  rank: integer('rank').notNull(),
  period: text('period', { enum: ['daily', 'weekly', 'monthly', 'all_time'] }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Assessment = typeof assessments.$inferSelect
export type NewAssessment = typeof assessments.$inferInsert
export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert
export type AIInsight = typeof aiInsights.$inferSelect
export type NewAIInsight = typeof aiInsights.$inferInsert
export type LeaderboardEntry = typeof leaderboard.$inferSelect
export type NewLeaderboardEntry = typeof leaderboard.$inferInsert
