# Plataforma Microfinanciera - MicroCredit

## Overview

This is a comprehensive fintech platform called "MicroCredit" that provides microfinance services including personal loans, business credits, and financial planning. The application is built as a full-stack web platform with a modern React frontend and Express.js backend, designed to streamline the loan application process from registration through approval.

The platform focuses on financial inclusion, offering quick loan approvals, flexible payment terms, and a completely digital application process. It targets individuals and small businesses seeking accessible financial services with competitive rates and transparent terms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling via shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system based on purple color palette
- **State Management**: TanStack Query for server state, React Context for local state (theme, language)
- **Form Handling**: React Hook Form with Zod validation schemas
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript throughout the stack
- **API Design**: RESTful API structure with /api prefix
- **Session Management**: Express sessions with PostgreSQL session store
- **Error Handling**: Centralized error handling middleware with structured error responses

### Database Layer
- **Primary Database**: PostgreSQL for relational data storage
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Migrations**: Drizzle Kit for schema management and migrations
- **Schema**: Shared TypeScript schema definitions between frontend and backend

### Authentication & Authorization
- **Session-based Authentication**: Server-side sessions stored in PostgreSQL
- **Password Security**: Planned implementation for password hashing
- **Form Validation**: Multi-step validation with Zod schemas
- **OTP Verification**: Phone and email verification system for user registration

### Application Flow
- **Multi-step Process**: Registration → Verification → Pre-application → Evaluation
- **Progressive Data Collection**: Minimal initial data requirements with progressive enhancement
- **Document Upload**: File handling for loan documentation
- **Geolocation**: Optional location services for risk assessment

### Design System
- **Component Library**: Comprehensive UI component system with consistent styling
- **Theme Support**: Light/dark mode with CSS custom properties
- **Internationalization**: Spanish/English language support with context-based translations
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Accessibility**: ARIA labels and keyboard navigation support

### Development Infrastructure
- **Monorepo Structure**: Shared schema and utilities between client/server
- **Development Server**: Vite dev server with HMR and Express API proxy
- **Type Safety**: End-to-end TypeScript with strict configuration
- **Code Quality**: ESLint and TypeScript compiler checks

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Database Connection**: `@neondatabase/serverless` driver for optimal serverless performance

### UI Component Libraries
- **Radix UI**: Comprehensive set of accessible, headless UI components including dialogs, forms, navigation
- **Lucide React**: Icon library for consistent iconography throughout the application
- **React Icons**: Additional icon sets including social media icons (FaGoogle)

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation for forms and API data
- **@hookform/resolvers**: Integration layer between React Hook Form and Zod

### Styling and Design
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Class Variance Authority**: Component variant management for design system
- **clsx & tailwind-merge**: Conditional class name handling and optimization

### State Management and Data Fetching
- **TanStack React Query**: Server state management with caching, background updates, and optimistic updates
- **React Context**: Client-side state for theme preferences and language selection

### Development and Build Tools
- **Vite**: Modern build tool with fast HMR and optimized production builds
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler for production server builds

### Database and ORM
- **Drizzle ORM**: Type-safe database operations with excellent TypeScript integration
- **Drizzle Kit**: Database migration and schema management tools
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Utilities and Helpers
- **date-fns**: Modern date utility library for date formatting and manipulation
- **nanoid**: Secure URL-friendly unique ID generator
- **ws**: WebSocket library for real-time database connections