# Overview

**Kala Kaushal** is an AI-powered sports talent assessment platform designed to democratize athletic talent discovery in India. The platform combines a React-based web application with AI-driven video analysis to evaluate athletic performance. Athletes can record fitness tests through an intuitive interface, receive AI-powered feedback on their technique and performance, and connect with sports scouts. The system supports multiple regional languages (Hindi, Gujarati, English) and features a dark-themed, futuristic UI with extensive animations and gamification elements.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI System**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme variables and animations
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Animations**: Framer Motion for complex animations and transitions
- **Design System**: Component-based architecture with reusable UI elements

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL as the database
- **Authentication**: Replit Auth integration with session management
- **File Uploads**: Multer middleware for video file handling
- **AI Integration**: OpenAI API for video analysis and performance assessment
- **API Design**: RESTful endpoints with standardized error handling

## Database Design
- **Sessions Table**: Required for Replit Auth session storage
- **Users Table**: Core user management with role-based access (athlete, scout, admin)
- **Athletes Table**: Extended profile information including biometrics and sports data
- **Assessments Table**: Video assessment records with AI analysis results
- **Test Types**: Standardized fitness tests (sprint, jump, agility, etc.)
- **Performance Metrics**: Tracked performance data over time
- **Achievements System**: Gamification elements with badges and progress tracking

## AI & Video Processing
- **Video Analysis**: OpenAI's vision capabilities for movement analysis
- **Performance Scoring**: Automated scoring based on form, technique, and metrics
- **Real-time Feedback**: Computer vision guidance during recording
- **Form Analysis**: Joint angle detection and posture evaluation
- **Progress Tracking**: Historical performance comparison and improvement suggestions

## Security & Authentication
- **Replit Auth**: OAuth-based authentication with session management
- **Role-based Access**: Different interfaces for athletes vs scouts
- **File Validation**: Video file type and size restrictions
- **Data Privacy**: Secure storage of personal and performance data

## Mobile-First Design
- **Responsive Layout**: Mobile-optimized interface with touch-friendly interactions
- **PWA Capabilities**: Offline functionality for video recording
- **Native-like Navigation**: Bottom navigation for mobile devices
- **Performance Optimization**: Lazy loading and efficient rendering

# External Dependencies

## Core Infrastructure
- **Neon Database**: PostgreSQL hosting with connection pooling
- **Replit Auth**: Authentication and user management system
- **OpenAI API**: AI-powered video analysis and computer vision

## Frontend Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **TanStack React Query**: Server state management and caching
- **Framer Motion**: Advanced animations and gesture handling
- **React Hook Form**: Form management with validation
- **Wouter**: Lightweight routing solution

## Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling framework
- **Drizzle Kit**: Database migration and schema management

## Media & File Handling
- **Multer**: Multipart form data and file upload handling
- **Web APIs**: Camera access and media recording capabilities

## Build & Deployment
- **ESBuild**: Fast JavaScript bundling for production
- **PostCSS**: CSS processing and optimization
- **Replit**: Development environment and hosting platform