# Trade Promotion Management (TPM) Data Product

## Overview

This is a comprehensive Trade Promotion Management platform designed to optimize promotional investments for CPG companies. The system provides end-to-end promotion lifecycle management, from planning and forecasting to execution and ROI evaluation, with AI-powered insights and automation capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack TypeScript Application
- **Frontend**: React with TypeScript using Vite build system
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Authentication**: Replit Auth with OpenID Connect
- **Deployment**: Replit-ready with development and production configurations

## Key Components

### Frontend Architecture
- **Component Structure**: Modular UI components using Radix UI primitives
- **Styling**: Tailwind CSS with custom design system variables
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Charts**: Chart.js for data visualization
- **State**: TanStack Query for API state management

### Backend Architecture
- **API Layer**: RESTful Express.js routes with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with OpenID Connect strategy
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Middleware**: Request logging, JSON parsing, error handling

### Database Schema
The system uses a comprehensive PostgreSQL schema with the following core entities:
- **Users**: Authentication and user profile management
- **Accounts**: Retail customers and distributors
- **Products**: Product catalog management
- **Promotions**: Core promotion planning and tracking
- **Budget Allocations**: Financial planning and tracking
- **Deductions**: Trade deduction management and reconciliation
- **Sales Data**: Performance tracking and analytics
- **Activities**: Audit trail and collaboration features

## Data Flow

### Promotion Lifecycle
1. **Planning**: Users create promotions with forecasting and budgeting
2. **Approval**: Automated workflow system for promotion approval
3. **Execution**: Real-time tracking and monitoring
4. **Reconciliation**: Deduction matching and settlement
5. **Analysis**: ROI calculation and performance evaluation

### Authentication Flow
1. OpenID Connect integration with Replit Auth
2. Session-based authentication with PostgreSQL storage
3. Role-based access control with 5 roles:
   - **Admin**: Full access to all features (IT department)
   - **Sales Manager**: Promotion planning and execution
   - **Finance Analyst**: Budget and ROI analysis
   - **Trade Development**: Promotion strategy and forecasting
   - **Executive**: High-level analytics and reporting
4. Automatic session management and renewal
5. Admin role assigned to eduardodmoraes@gmail.com with IT department

### Data Processing
- Real-time KPI calculations and aggregations
- Automated deduction matching algorithms
- AI-powered forecasting and optimization (placeholder for ML integration)
- Historical data analysis for trend identification

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **chart.js**: Data visualization and charting
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect implementation

### Development Tools
- **Vite**: Fast development build system
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **Drizzle Kit**: Database migration and management

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- Automatic Replit integration with cartographer
- Environment-based configuration
- Real-time error overlay for debugging

### Production Build
- Vite production build for frontend assets
- ESBuild for backend compilation
- Single-command deployment process
- Environment variable configuration for database and auth

### Database Management
- Drizzle migrations in `./migrations` directory
- Database push commands for schema updates
- PostgreSQL connection via environment variables
- Session storage integrated with main database

### Key Features Implemented
- Dashboard with KPI monitoring and ROI analytics
- Promotion calendar with planning and forecasting
- Budget management and allocation tracking
- Deduction management with automated processing
- User authentication and role-based access
- Comprehensive Settings page with 5 main sections:
  - Profile Management with user information editing
  - Notification preferences for email and app alerts
  - Display & regional preferences (theme, language, timezone, currency)
  - Dashboard configuration with widget visibility controls
  - Business settings for fiscal year, ROI targets, and approval thresholds
- **Admin User Management System** (Admin-only access):
  - Complete user management with CRUD operations
  - Role assignment and permission management
  - Department organization and user grouping
  - User status management (active/inactive)
  - Advanced filtering and search capabilities
  - Export/import functionality for user data
- **Smart API Key Management System** (Admin-only access):
  - Database-driven API key generation and management
  - Secure key creation with auto-generated unique identifiers
  - Integration guide with copy-paste code examples for external systems
  - Support for Databricks, cURL, and Power BI integrations
  - Comprehensive API endpoints documentation
  - Key usage tracking and last-used timestamps
  - Visual management interface with show/hide functionality
- **External System Integration**:
  - API key authentication middleware for secure external access
  - RESTful endpoints for accounts, products, promotions, budgets, deductions, and sales data
  - Complete Databricks integration with Python code examples
  - Foreign key relationship handling for data integrity
  - Error handling and validation for external API calls
- Responsive design with mobile support
- Real-time data updates and notifications

The application follows modern web development best practices with a focus on type safety, performance, and user experience. The modular architecture allows for easy feature extension and maintenance.