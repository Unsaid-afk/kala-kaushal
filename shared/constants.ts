export const APP_NAME = 'Kala Kaushal'
export const APP_DESCRIPTION = 'AI-Powered Sports Talent Assessment Platform'

export const ROUTES = {
  HOME: '/',
  ASSESSMENT: '/assessment',
  ATHLETE_DASHBOARD: '/athlete-dashboard',
  SCOUT_DASHBOARD: '/scout-dashboard',
  ATHLETE_PROFILE: '/athlete-profile',
  LEADERBOARD: '/leaderboard',
  RESULTS: '/results',
  VIDEO_RECORDING: '/video-recording',
  KALA_PRADARSHAN: '/kala-pradarshan',
} as const

export const USER_ROLES = {
  ATHLETE: 'athlete',
  SCOUT: 'scout',
  COACH: 'coach',
  ADMIN: 'admin',
} as const

export const ASSESSMENT_TYPES = {
  VIDEO: 'video',
  PERFORMANCE: 'performance',
  SKILL: 'skill',
} as const

export const ASSESSMENT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export const AI_INSIGHT_TYPES = {
  PERFORMANCE: 'performance',
  TECHNIQUE: 'technique',
  IMPROVEMENT: 'improvement',
} as const

export const LEADERBOARD_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  ALL_TIME: 'all_time',
} as const

export const SPORTS_CATEGORIES = [
  'Cricket',
  'Football',
  'Basketball',
  'Tennis',
  'Badminton',
  'Volleyball',
  'Athletics',
  'Swimming',
  'Gymnastics',
  'Martial Arts',
] as const

export const PERFORMANCE_METRICS = {
  SPEED: 'speed',
  ACCURACY: 'accuracy',
  POWER: 'power',
  ENDURANCE: 'endurance',
  FLEXIBILITY: 'flexibility',
  COORDINATION: 'coordination',
  REACTION_TIME: 'reaction_time',
  STRATEGY: 'strategy',
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
  },
  ASSESSMENTS: {
    LIST: '/api/assessments',
    CREATE: '/api/assessments',
    GET: '/api/assessments/:id',
    UPDATE: '/api/assessments/:id',
    DELETE: '/api/assessments/:id',
  },
  VIDEOS: {
    UPLOAD: '/api/videos/upload',
    LIST: '/api/videos',
    GET: '/api/videos/:id',
    DELETE: '/api/videos/:id',
  },
  AI_INSIGHTS: {
    GENERATE: '/api/ai/insights',
    LIST: '/api/ai/insights',
    GET: '/api/ai/insights/:id',
  },
  LEADERBOARD: {
    GET: '/api/leaderboard',
  },
} as const

export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  MAX_DURATION: 300, // 5 minutes
} as const

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const
