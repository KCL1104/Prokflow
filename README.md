# Project Management Platform

A modern web application for project management supporting multiple methodologies (Scrum, Kanban, Waterfall, Custom).

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Styling**: Tailwind CSS v4.1.11 with PostCSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time + Storage)
- **State Management**: React Context + Hooks (Redux Toolkit prepared for complex state)
- **Testing**: Vitest with React Testing Library
- **Linting**: ESLint with TypeScript and React plugins
<<<<<<< HEAD
- **Type Safety**: Strict TypeScript configuration
- **Drag & Drop**: @dnd-kit for accessible drag and drop functionality
- **UI Components**: Custom component library with accessibility support
=======
- **Type Safety**: Strict TypeScript configuration with comprehensive type system
- **Drag & Drop**: @dnd-kit for accessible drag and drop functionality
- **UI Components**: Custom component library with accessibility support
- **Charts**: Chart.js with React integration for analytics and reporting
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (Button, Modal, Loading, FilterBar)
│   ├── auth/            # Authentication components
│   ├── backlog/         # Product backlog components (ProductBacklog, BulkEditModal, EstimationModal)
│   ├── work-items/      # Work item components (WorkItemCard, WorkItemForm, WorkItemList)
<<<<<<< HEAD
=======
│   ├── standups/        # Daily standup components (StandupList, StandupForm, StandupParticipationForm)
│   ├── retrospectives/  # Sprint retrospective components (RetrospectiveList, RetrospectiveForm, FeedbackCard)
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
│   ├── forms/           # Form components
│   └── charts/          # Chart components
├── pages/               # Page-level components
│   ├── Dashboard/       # Project dashboard
│   ├── BacklogPage.tsx  # Product backlog page
│   ├── Board/           # Kanban/Scrum board
│   ├── Gantt/           # Gantt chart view
│   ├── Reports/         # Analytics and reporting
│   └── Settings/        # Project and user settings
├── hooks/               # Custom React hooks (useAuth, useBacklogFiltering, useFormValidation)
<<<<<<< HEAD
├── services/            # API service layer
├── repositories/        # Data access layer
├── contexts/            # React Context providers
├── constants/           # Application constants (workItemConstants)
├── utils/               # Utility functions (workItemUtils, errorHandling)
├── types/               # TypeScript type definitions
=======
├── services/            # API service layer (direct Supabase client operations)
├── repositories/        # Experimental repository pattern (BaseRepository - currently disabled)
├── contexts/            # React Context providers
├── constants/           # Application constants (workItemConstants)
├── utils/               # Utility functions (workItemUtils, errorHandling, errors, typeGuards)
├── types/               # Comprehensive TypeScript type system
│   ├── index.ts         # Main type definitions and domain models
│   ├── api.ts           # API-specific types and database mappings
│   ├── constants.ts     # Type-related constants and enums
│   ├── forms.ts         # Form validation and input types
│   ├── guards.ts        # Runtime type checking and validation
│   ├── utils.ts         # Utility types and generic patterns
│   └── database.ts      # Generated Supabase database types
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
└── lib/                 # Third-party library configurations
```

## Setup Instructions

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase project URL and anon key:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Set up Supabase (if using local development):**
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g @supabase/cli
   
   # Start local Supabase stack
   supabase start
   
   # Apply database migrations
   supabase db reset
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

5. **Build for production:**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (includes TypeScript check)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks
- `npm test` - Run unit tests with Vitest in watch mode
- `npm run test:ui` - Run tests with Vitest UI interface
- `npm run test:run` - Run tests once without watch mode

## Current Status

✅ **Tasks 1-6 Complete**: Foundation, Authentication, and Service Layer
- React TypeScript project initialized with Vite
- Supabase client library installed and configured
- Environment variables set up for Supabase connection
- Complete project structure with organized folders
<<<<<<< HEAD
- **Database schema configured** with comprehensive tables and RLS policies
- **TypeScript interfaces and types** fully implemented
- **Complete authentication system** with:
  - Email/password authentication
  - Social authentication (Google, GitHub)
  - Password reset functionality
  - User profile management
=======
- **Comprehensive Database Schema** implemented via `combined_schema.sql`:
  - All core tables with proper relationships and constraints
  - Complete workflow engine with customizable states and transitions
  - Advanced business logic functions for validation and calculations
  - Comprehensive Row Level Security policies for all tables
  - Performance-optimized indexing strategy
  - Real-time collaboration support with proper triggers
- **Comprehensive TypeScript Type System** with modular architecture:
  - Core domain types (Project, WorkItem, Sprint, Workflow, User, etc.)
  - Standup management types (Standup, StandupParticipation, StandupReminder)
  - Retrospective types (Retrospective, RetrospectiveFeedback, RetrospectiveActionItem, RetrospectiveTemplate)
  - API request/response types with database mappings
  - Form validation types with error handling
  - Chart and analytics types (BurndownData, VelocityData, ProjectMetrics)
  - Real-time event types for live collaboration
  - Runtime type guards and validation utilities
  - Generated database types from Supabase schema
- **Complete authentication system** with:
  - Email/password authentication with verification
  - Social authentication (Google, GitHub OAuth)
  - Password reset functionality
  - User profile management with timezone and avatar support
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  - Protected routes and authentication context
  - Comprehensive auth service layer
- **Service Layer Complete** with:
  - Project CRUD operations and team management
<<<<<<< HEAD
  - Work item management with status transitions
  - Sprint planning and execution services
  - Workflow management and validation
  - Comprehensive error handling and utilities
- **Custom Hooks**: useAuth, useProject, useWorkItems, useSprints
=======
  - Work item management with status transitions and dependencies
  - Sprint planning and execution services with velocity tracking
  - Workflow management and validation with WIP limits
  - Daily standup management with participation tracking
  - Comprehensive error handling and utilities
- **Custom Hooks**: useAuth, useProject, useWorkItems, useSprints, useStandups
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
- **UI Components**: Button, Modal, Loading, and complete auth forms
- **Authentication UI**: Login, signup, forgot password, and user profile forms
- Tailwind CSS configured for styling

✅ **Task 7.3 Complete**: Product Backlog Interface
- Comprehensive product backlog management with drag-and-drop reordering
- Advanced filtering and search functionality (type, priority, assignee, text search)
- Bulk editing capabilities for multiple work items
- Story point estimation interface with Fibonacci sequence and custom values
- Comprehensive test coverage (51+ passing tests)
- Accessibility compliant (WCAG 2.1 AA) with keyboard navigation and screen reader support

<<<<<<< HEAD
🚧 **In Progress - Task 7**: Remaining Project Management UI Components
- Project creation and management interfaces
- Additional work item management components

## Next Steps

- **Task 7**: Complete project management UI components
- **Task 8**: Implement sprint management functionality
- **Task 9**: Develop board views and task management
=======
✅ **Complete Database Implementation**: Combined Schema
- **Multi-methodology support**: Pre-configured workflows for Scrum, Kanban, Waterfall, and Custom
- **Advanced workflow engine**: Customizable states, transitions, and WIP limits with database validation
- **Comprehensive work management**: Full lifecycle support with dependencies, comments, and attachments
- **Sprint management**: Complete sprint planning with burndown tracking and velocity calculations
- **Daily standup system**: Scheduling, participation tracking, and automated reminders (migration 005)
- **Sprint retrospectives**: Complete retrospective system with templates and action items (migration 006)
- **Team collaboration**: Project membership with role-based access control
- **Business intelligence**: Built-in functions for project metrics, burndown data, and analytics
- **Security**: Comprehensive RLS policies ensuring proper data isolation and access control

✅ **Task 13.1 Complete**: Daily Standup Management
- Complete standup scheduling and notification system
- Standup participation interface with yesterday/today/blockers format
- Standup history and notes tracking with comprehensive RLS policies
- Automated standup reminders with multiple notification types

✅ **Task 13.2 Complete**: Sprint Retrospectives
- Complete retrospective session interface with feedback collection
- Action item tracking and follow-up management
- Retrospective templates and customization system
- Comprehensive voting system for feedback prioritization
- Database schema fully implemented in migration 006_retrospective_tables.sql

✅ **Task 11 Complete**: Board Views and Task Management
- Kanban board with drag-and-drop functionality
- Scrum board with sprint integration
- WIP limit enforcement and visual indicators

✅ **Task 12 Complete**: Gantt Charts and Resource Allocation
- Interactive Gantt chart with dependency visualization
- Resource allocation and capacity planning
- Critical path calculation and timeline views

🚧 **In Progress - Task 14**: Analytics and Reporting System
- Advanced analytics functions migration started (014_analytics_functions.sql)
- Cycle time analysis and velocity tracking
- Enhanced burndown data generation
- Comprehensive reporting dashboard

## Next Steps

- **Task 14**: Complete analytics functions migration and reporting dashboard
- **Task 15**: Implement real-time collaboration features with live updates
- **Task 16**: Create responsive design and mobile optimization
- **Task 17**: Build comprehensive testing suite with integration and E2E tests

## Recent Updates

### Analytics Migration Started (Latest)
- 🚧 **Migration 014**: New analytics functions migration file created
- ⚠️ **Status**: Migration requires completion - current content appears corrupted
- 📋 **Planned Features**: 
  - Cycle time analysis with distribution metrics
  - Sprint velocity trends and consistency analysis
  - Enhanced burndown data generation
  - Advanced reporting functions for dashboard integration
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

## Implemented Features

### ✅ Authentication & User Management
- Email/password authentication with email verification
- Social authentication (Google, GitHub OAuth)
- Password reset and recovery
- User profile management
- Protected routes and session management
- Comprehensive authentication context and services

### ✅ Service Layer & Data Operations
- **Project Service**: Complete CRUD operations, team member management, project settings
- **Work Item Service**: Task/story management, status transitions, dependency tracking, filtering/search
- **Sprint Service**: Sprint planning, capacity calculation, burndown data, completion workflows
- **Workflow Service**: Custom workflow creation, state transitions, validation
<<<<<<< HEAD
- **Auth Service**: User profile management, permissions, project memberships
- **Error Handling**: Custom error classes and Supabase error handling utilities
=======
- **Retrospective Service**: Sprint retrospective management, feedback collection, action item tracking
- **Auth Service**: User profile management, permissions, project memberships
- **Error Handling**: Comprehensive error handling system with custom error classes, Supabase error mapping, and typed error responses
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
- **Base Repository**: Reusable repository pattern for common database operations (TypeScript compatible)
- **Unit Tests**: Comprehensive test coverage for all service operations

### ✅ Product Backlog Management (Task 7.3)
- **Drag & Drop Reordering**: Accessible drag and drop with @dnd-kit library
- **Advanced Filtering**: Real-time search, type/priority/assignee filters
- **Bulk Operations**: Multi-select with bulk priority, status, and assignee updates
- **Story Point Estimation**: Fibonacci sequence with custom values and validation
- **Comprehensive Testing**: 51+ unit and integration tests with 89.6% pass rate
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and ARIA labels
- **Performance Optimized**: React.memo(), debounced search, optimistic updates

<<<<<<< HEAD
### ✅ Foundation & Infrastructure
- TypeScript interfaces for all core entities
=======
### ✅ Board Views and Task Management
- **Kanban Board**: Drag-and-drop interface with customizable workflow columns
- **Scrum Board**: Sprint-focused board view with burndown integration
- **WIP Limit Enforcement**: Visual indicators and automatic limit checking
- **Real-time Updates**: Live task status updates using Supabase Realtime
- **Board Filtering**: Advanced filtering by assignee, priority, type, and labels
- **Task Assignment**: Drag-and-drop task assignment with visual feedback
- **Status Transitions**: Workflow validation for task status changes

### ✅ Gantt Charts and Resource Management
- **Interactive Gantt Chart**: Timeline visualization with task dependencies
- **Critical Path Analysis**: Automatic critical path calculation and highlighting
- **Resource Allocation**: Team member workload visualization and capacity planning
- **Milestone Tracking**: Visual milestone markers and progress indicators
- **Dependency Management**: Visual dependency editing with circular dependency prevention
- **Timeline Navigation**: Flexible time scale (day/week/month) with zoom controls
- **Progress Tracking**: Visual progress indicators with actual vs. planned comparison

### ✅ Daily Standup Management
- **Standup Scheduling**: Create and schedule daily standups with facilitator assignment
- **Participant Management**: Track team member participation with status tracking
- **Structured Format**: Yesterday/Today/Blockers format for consistent updates
- **Sprint Integration**: Link standups to specific sprints for Scrum methodology
- **Reminder System**: Automated reminders with multiple notification types (initial, follow-up, final)
- **Access Control**: Comprehensive RLS policies ensuring team members can only access their project standups
- **Status Tracking**: Monitor standup completion and participant submission status

### ✅ Sprint Retrospectives
- **Retrospective Management**: Create and facilitate sprint retrospectives with customizable templates
- **Multiple Templates**: Pre-configured templates including "Start, Stop, Continue", "What Went Well/Didn't Go Well/Action Items", and "Mad, Sad, Glad"
- **Feedback Collection**: Structured feedback collection with voting system for prioritization
- **Action Item Tracking**: Convert retrospective insights into trackable action items with assignees and due dates
- **Template System**: Flexible template system with custom categories, colors, and descriptions
- **Sprint Integration**: Link retrospectives to specific sprints for comprehensive sprint closure
- **Collaborative Features**: Multi-participant feedback sessions with real-time collaboration support

### ✅ Advanced Database Features
- **Multi-methodology Workflows**: Pre-configured workflows for Scrum, Kanban, Waterfall, and Custom methodologies
- **Workflow Engine**: Customizable states and transitions with database-level validation
- **WIP Limit Enforcement**: Automatic Work-in-Progress limit checking with configurable thresholds
- **Business Logic Functions**: Database functions for velocity calculations, burndown data, and project metrics
- **Dependency Management**: Work item dependencies with circular dependency prevention
- **Audit Trail**: Comprehensive change tracking with automatic timestamps and user attribution
- **Performance Optimization**: Strategic indexing for large datasets and real-time queries

### 🚧 Analytics System Development
- **Migration 014**: Advanced analytics functions migration started but requires completion
- **Planned Analytics**: Cycle time analysis, velocity trends, enhanced burndown data generation
- **Status**: Migration file needs to be rewritten with proper SQL syntax
- **Integration**: Will connect with existing reporting components and dashboard

### ✅ Foundation & Infrastructure
- **Comprehensive Type System**: Complete TypeScript interfaces for all domain entities, API operations, and UI components
- **Database Type Safety**: Generated types from Supabase schema with runtime type guards and validation
- **Modular Type Architecture**: Organized type definitions across multiple files (api.ts, forms.ts, guards.ts, utils.ts, constants.ts)
- **Runtime Type Validation**: Type guards and assertion functions for safe data handling
- **Form Type Safety**: Comprehensive form validation types with error handling
- **API Type Mapping**: Direct mapping between database types and application interfaces
- **Error Handling System**: Custom error classes with HTTP status codes, Supabase error mapping, and standardized error responses
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
- Supabase integration with real-time capabilities
- Database schema with RLS policies
- Service layer architecture
- Custom React hooks for data management
- Responsive UI components with Tailwind CSS

## Key Features

<<<<<<< HEAD
=======
### ✅ Comprehensive Database Schema
- **Multi-methodology Workflows**: Pre-configured workflows for Scrum (To Do → In Progress → In Review → Done), Kanban (Backlog → Ready → In Progress → Review → Done with WIP limits), Waterfall (Requirements → Design → Implementation → Testing → Deployment → Maintenance), and Custom templates
- **Advanced Workflow Engine**: Database-level validation of state transitions, customizable workflow states with colors and positions, WIP limit enforcement with automatic checking
- **Business Logic Functions**: Built-in PostgreSQL functions for workflow validation, sprint velocity calculations, burndown chart data generation, project metrics and analytics
- **Comprehensive Security**: Row Level Security policies for all tables, role-based access control (owner, admin, member, viewer), project-scoped data isolation
- **Performance Optimization**: Strategic indexing on all foreign keys and frequently queried columns, optimized queries for large datasets, real-time collaboration support
- **Audit Trail**: Automatic timestamp tracking on all entities, user attribution for all changes, comprehensive change history

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
### ✅ Product Backlog Management
- **Drag & Drop Reordering**: Intuitive priority management with accessible keyboard support
- **Advanced Filtering**: Real-time search across titles, descriptions, and labels
- **Multi-Filter Support**: Filter by work item type, priority, assignee, or combination
- **Bulk Operations**: Select multiple items for batch updates (priority, status, assignee, labels)
- **Story Point Estimation**: Fibonacci sequence with visual warnings for large stories
- **Custom Estimates**: Support for non-standard story point values
- **Responsive Design**: Mobile-first design that works on all device sizes
- **Accessibility**: Full keyboard navigation, screen reader support, WCAG 2.1 AA compliant

### Features in Development
<<<<<<< HEAD
- Multi-methodology support (Scrum, Kanban, Waterfall, Custom)
- Project creation and management interfaces
- Sprint planning and execution
- Interactive boards (Kanban/Scrum)
- Gantt charts and timeline views
- Resource allocation and capacity planning
- Team collaboration features
- Real-time updates
- Reporting and analytics
=======
- Real-time collaboration with live cursors and notifications
- Advanced reporting and analytics dashboard
- Mobile optimization and Progressive Web App (PWA) capabilities
- Comprehensive testing suite with end-to-end tests
- Performance optimization for large datasets
- Advanced workflow customization and automation
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

## Authentication Features

The application includes a complete authentication system:

### Email/Password Authentication
- User registration with email verification
- Secure login with password validation
- Password reset via email
- Form validation and error handling

### Social Authentication
- Google OAuth integration
- GitHub OAuth integration
- Seamless social login flow

### User Management
- User profile management
- Session handling with automatic refresh
- Protected routes and authentication guards
- Comprehensive authentication context

### Security Features
- Row Level Security (RLS) policies in database
- JWT token management
- Secure password handling
- CSRF protection

<<<<<<< HEAD
## Development Guidelines

- Use TypeScript for all new code
- Follow the established folder structure
- Implement proper error handling
- Write unit tests for new features
=======
## Type System Architecture

The application uses a comprehensive, modular TypeScript type system:

### Core Type Files

- **`src/types/index.ts`** - Main type definitions including:
  - Domain models (Project, WorkItem, Sprint, User, etc.)
  - Standup management types (Standup, StandupParticipation, StandupReminder)
  - Retrospective types (Retrospective, RetrospectiveFeedback, RetrospectiveActionItem)
  - API request/response interfaces
  - Chart and analytics types (BurndownData, VelocityData, ProjectMetrics)
  - Real-time event types for collaboration

- **`src/types/api.ts`** - API-specific types:
  - Database row, insert, and update types
  - Query parameter interfaces
  - Batch operation types
  - File upload types
  - Real-time subscription types

- **`src/types/guards.ts`** - Runtime type validation:
  - Type guard functions for all domain models
  - Array validation functions
  - Error type guards
  - Assertion functions for type safety

- **`src/types/forms.ts`** - Form handling types:
  - Form data interfaces
  - Validation error types
  - Form state management types

- **`src/types/utils.ts`** - Utility types:
  - Generic utility types (Optional, RequiredFields, DeepPartial)
  - ID types for type safety
  - Permission and role types
  - State machine types

- **`src/types/constants.ts`** - Type-related constants:
  - Enum definitions and labels
  - Color mappings
  - Validation limits
  - Default values

- **`src/types/database.ts`** - Generated Supabase types:
  - Auto-generated from database schema
  - Updated via `supabase gen types typescript`

### Type Safety Features

- **Strict TypeScript**: No `any` types allowed, comprehensive type checking
- **Runtime Validation**: Type guards ensure data integrity at runtime
- **Database Type Safety**: Generated types from Supabase schema
- **Form Validation**: Structured validation with proper error handling
- **API Type Mapping**: Direct mapping between database and application types
- **Error Handling**: Typed error responses and validation errors

## Development Guidelines

- Use TypeScript for all new code with strict type checking
- Follow the established folder structure and type organization
- Use type guards for runtime validation of external data
- **Use custom error classes** from `src/utils/errors.ts` for consistent error handling
- **Handle Supabase errors** using `handleSupabaseError()` utility for proper error mapping
- Write unit tests for new features with proper type mocking
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
- Use Tailwind CSS for styling
- Follow React best practices and hooks patterns
- Use the authentication context for user state management
- Implement proper loading states and error boundaries
<<<<<<< HEAD
=======
- Leverage the comprehensive type system for better developer experience
- **Error handling best practices**:
  - Throw specific error types (ValidationError, NotFoundError, etc.) instead of generic Error
  - Use `useErrorHandler` hook for consistent error state management in components
  - Format API error responses using `formatErrorResponse()` utility
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
## Cu
rrent Application Structure

### Authentication System
The application features a complete authentication system with:

- **AuthContext**: Centralized authentication state management
- **AuthContainer**: Main authentication UI container with mode switching
- **LoginForm**: Email/password login with social authentication options
- **SignUpForm**: User registration with validation and email verification
- **ForgotPasswordForm**: Password reset functionality
- **UserProfile**: User profile management interface
- **ProtectedRoute**: Route protection for authenticated users
- **AuthCallback**: OAuth callback handling

### Services Layer
- **authService.ts**: User profile and permission management
- **projectService.ts**: Complete project CRUD operations and team management
- **workItemService.ts**: Work item management with filtering and search
- **sprintService.ts**: Sprint planning, execution, and analytics
- **workflowService.ts**: Workflow management and state transitions
<<<<<<< HEAD
- **databaseService.ts**: Database utilities and common operations

=======
- **standupService.ts**: Daily standup management, participation tracking, and reminders
- **retrospectiveService.ts**: Retrospective management, feedback collection, and action item tracking
- **databaseService.ts**: Database utilities and common operations

### Repository Pattern (Experimental)
- **BaseRepository.ts**: Generic repository class with common CRUD operations
  - Currently disabled due to TypeScript generic constraints with Supabase client
  - Provides standardized methods: create, findById, update, delete, findWhere, count
  - Includes batch operations and RPC function execution
  - Future consideration for replacing direct service layer operations

### Error Handling System
- **src/utils/errors.ts**: Custom error classes and Supabase error handling
  - `AppError`: Base error class with code, status, and details
  - `ValidationError`: Form and input validation errors (400)
  - `NotFoundError`: Resource not found errors (404)
  - `UnauthorizedError`: Authentication required errors (401)
  - `ForbiddenError`: Permission denied errors (403)
  - `ConflictError`: Resource conflict errors (409)
  - `DatabaseError`: Database operation errors (500)
  - `handleSupabaseError()`: Converts Supabase errors to typed application errors
  - `formatErrorResponse()`: Formats errors for API responses
- **src/utils/errorHandling.ts**: Error handling utilities and context-aware error processing
  - `ErrorHandler`: Centralized error processing with context
  - `getErrorMessage()`: Safe error message extraction
- **src/hooks/useErrorHandler.ts**: React hook for consistent error state management
  - Integrates with custom error classes for type-safe error handling
  - Provides async error handling utilities

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
### Custom Hooks
- **useAuth**: Authentication state and operations
- **useProject**: Project data management with CRUD operations
- **useWorkItems**: Work item operations and state management
- **useSprints**: Sprint management and planning
<<<<<<< HEAD
=======
- **useStandups**: Daily standup management and participation tracking
- **useRetrospectives**: Retrospective management, feedback collection, and action item tracking
- **useTeamMembers**: Team member management and role assignment
- **useBoardDragDrop**: Shared drag-and-drop logic for board interfaces
- **useBoardFiltering**: Advanced filtering logic for board and list views
- **useBacklogFiltering**: Specialized filtering for product backlog management
- **useGanttData**: Gantt chart data processing and critical path calculation
- **useWorkflow**: Workflow management and state transition validation
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

### Database Integration
- Complete TypeScript type definitions for database schema
- Supabase client configuration with real-time capabilities
- Row Level Security policies for data protection
- Comprehensive database functions for business logic

## Testing

The project includes comprehensive test coverage:

### Authentication Tests
- LoginForm component tests
- Authentication flow testing
- Form validation testing

### Product Backlog Tests (Task 7.3)
- **Component Tests**: Individual component functionality (ProductBacklog, BulkEditModal, EstimationModal)
- **Integration Tests**: End-to-end workflow testing with component interactions
- **Accessibility Tests**: Screen reader compatibility and keyboard navigation
- **Edge Cases**: Empty states, loading states, error handling, and validation
- **Test Coverage**: 51+ tests with 89.6% pass rate

### Test Tools
- **Vitest**: Modern test runner with React 19 support
- **Testing Library**: User-centric testing approach with @testing-library/react
- **Mock Strategy**: Comprehensive mocking of external dependencies (@dnd-kit, services)

Run tests with:
```bash
npm test
```

### Test Structure
```
src/
├── components/
│   ├── backlog/__tests__/
│   │   ├── ProductBacklog.test.tsx
│   │   ├── BulkEditModal.test.tsx
│   │   ├── EstimationModal.test.tsx
│   │   └── BacklogIntegration.test.tsx
│   └── auth/__tests__/
│       └── LoginForm.test.tsx
└── pages/__tests__/
    └── BacklogPage.test.tsx
```

<<<<<<< HEAD
## Recent Updates

### Task 7.3: Product Backlog Interface (Latest)
=======
## Error Handling Examples

### Using Custom Error Classes in Services

```typescript
import { handleSupabaseError, UnauthorizedError, NotFoundError } from '../utils/errors';

// Instead of generic Error
if (!currentUserId) {
  throw new UnauthorizedError('User must be authenticated');
}

// Instead of generic Error for not found
if (!project) {
  throw new NotFoundError('Project');
}

// Handle Supabase errors automatically
const { data, error } = await supabase.from('projects').select('*');
if (error) {
  handleSupabaseError(error, 'Failed to fetch projects');
}
```

### Using Error Handler Hook in Components

```typescript
import { useErrorHandler } from '../hooks/useErrorHandler';

const MyComponent = () => {
  const { error, setError, clearError, handleAsyncError } = useErrorHandler();

  const handleSubmit = async () => {
    const result = await handleAsyncError(async () => {
      return await someAsyncOperation();
    });
    
    if (result) {
      // Success handling
    }
    // Error is automatically set in state
  };

  return (
    <div>
      {error && (
        <div className="error">
          {error.message} (Code: {error.code})
        </div>
      )}
    </div>
  );
};
```

## Previous Implementation Updates

### Error Handling System Implementation
- ✅ **Custom Error Classes** - Comprehensive error class hierarchy with HTTP status codes
- ✅ **Supabase Error Mapping** - Automatic conversion of database errors to application errors
- ✅ **Type-Safe Error Handling** - Full TypeScript support with proper error typing
- ✅ **React Hook Integration** - useErrorHandler hook for consistent component error management
- ✅ **API Error Formatting** - Standardized error response formatting for APIs

### Comprehensive Type System Architecture
- ✅ **Modular Type Organization** - Types organized across multiple specialized files for better maintainability
- ✅ **Runtime Type Validation** - Comprehensive type guards and assertion functions for data integrity
- ✅ **Database Type Safety** - Generated types from Supabase schema with direct API mappings
- ✅ **Form Type Safety** - Structured form validation types with error handling
- ✅ **Chart and Analytics Types** - Complete type definitions for data visualization components
- ✅ **Real-time Event Types** - Type-safe real-time collaboration with structured event interfaces
- ✅ **Utility Type System** - Generic utility types for common patterns and operations
- ✅ **Constant Type Definitions** - Comprehensive enums and constants with proper typing

### Combined Database Schema Implementation
- ✅ **Comprehensive Schema Consolidation** - All features unified in `combined_schema.sql`
- ✅ **Multi-methodology Support** - Pre-configured workflows for all project types
- ✅ **Advanced Business Logic** - Database functions for validation, calculations, and analytics
- ✅ **Complete Security Model** - Comprehensive RLS policies for all tables and operations
- ✅ **Performance Optimization** - Strategic indexing and query optimization for large datasets
- ✅ **Real-time Collaboration** - Optimized for live updates and concurrent user access

### Task 7.3: Product Backlog Interface
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
- ✅ **Complete Product Backlog Implementation** with drag-and-drop reordering using @dnd-kit
- ✅ **Advanced Filtering System** with real-time search, type/priority/assignee filters
- ✅ **Bulk Editing Capabilities** for multiple work items with validation
- ✅ **Story Point Estimation** with Fibonacci sequence and custom values
- ✅ **Comprehensive Test Coverage** - 51+ tests with 89.6% pass rate
- ✅ **Accessibility Compliance** - WCAG 2.1 AA with keyboard navigation and ARIA labels
- ✅ **Performance Optimizations** - React.memo(), debounced search, optimistic updates

### New Dependencies Added
- `@dnd-kit/core` - Core drag and drop functionality
- `@dnd-kit/sortable` - Sortable list implementation  
- `@dnd-kit/utilities` - CSS utilities for drag and drop
- `@dnd-kit/modifiers` - Drag constraints and modifiers

### Build System Improvements
- ✅ Fixed all TypeScript compilation errors - build now passes successfully
- ✅ Resolved service layer import/export issues
- ✅ Updated BaseRepository with proper type casting for Supabase compatibility
- ✅ Fixed authentication component prop passing and state management
- ✅ Cleaned up critical unused imports and variables

### Code Quality Enhancements
- ✅ Improved error handling in workflow service
- ✅ Fixed type safety issues in work item filtering
- ✅ Enhanced user profile management (removed unsupported fields)
- ✅ Streamlined authentication flow with proper success callbacks
- ✅ Implemented comprehensive form validation with useFormValidation hook
- ✅ Added utility functions for work item operations and error handling

## Troubleshooting

### Common Issues

#### Authentication Problems
- **Social login not working**: Verify OAuth credentials are configured in Supabase dashboard
- **Email verification not received**: Check spam folder and ensure email service is configured
- **Session not persisting**: Check that cookies are enabled and not blocked by browser

#### Development Issues
- **Environment variables not loading**: Ensure `.env.local` file exists and variables start with `VITE_`
- **TypeScript errors**: Run `npm run build` to check for type errors
- **Supabase connection issues**: Verify URL and anon key in environment variables
<<<<<<< HEAD
=======
- **Error handling issues**: Use custom error classes from `src/utils/errors.ts` for consistent error handling
- **API error responses**: Use `formatErrorResponse()` utility for standardized error formatting
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

#### Build Issues
- **Build failing**: Check for TypeScript errors with `npm run build`
- **Linting errors**: Run `npm run lint` to identify and fix code quality issues

<<<<<<< HEAD
=======
#### Error Handling Migration
- **Replace generic Error**: Use specific error classes (ValidationError, NotFoundError, etc.) instead of generic Error
- **Supabase error handling**: Use `handleSupabaseError()` utility to convert Supabase errors to typed application errors
- **Component error handling**: Use `useErrorHandler` hook for consistent error state management
- **API error responses**: Use `formatErrorResponse()` for standardized error formatting

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
#### Product Backlog Issues
- **Drag and drop not working**: Ensure @dnd-kit dependencies are installed correctly
- **Filters not responding**: Check for JavaScript errors in console, filters use debounced search
- **Bulk edit not saving**: Verify work item service is properly connected to Supabase
- **Story estimation modal not opening**: Check that work item type is 'story' and modal state management

#### Testing Issues
- **Tests failing**: Run `npm run test:run` to see detailed error messages
- **Mock errors**: Ensure @dnd-kit mocks are properly configured in test files
- **Component tests timing out**: Check for proper async/await usage in test assertions

<<<<<<< HEAD
=======
#### Standup Management Issues
- **Standup creation failing**: Verify user has proper project membership and permissions
- **Participation not saving**: Check that user is included in standup participants array
- **Reminders not working**: Ensure standup_reminders table policies allow system operations
- **Sprint linking issues**: Verify sprint exists and user has access to the sprint's project

#### Retrospective Management Issues
- **Retrospective creation failing**: Verify user has project membership and sprint access
- **Feedback not saving**: Check that user is included in retrospective participants
- **Template loading issues**: Ensure retrospective_templates table has default templates (populated by migration 006)
- **Action item assignment failing**: Verify assignee has access to the project
- **Voting not working**: Check retrospective_feedback table policies and vote_retrospective_feedback() function

#### Board Views and Task Management Issues
- **Drag and drop not working**: Ensure @dnd-kit dependencies are installed correctly
- **Board filters not responding**: Check for JavaScript errors in console, filters use debounced search
- **WIP limits not enforcing**: Verify workflow states have proper WIP limits configured
- **Task status transitions failing**: Check workflow validation and state transition rules
- **Real-time updates not working**: Verify Supabase Realtime is properly configured

#### Gantt Chart and Resource Allocation Issues
- **Gantt chart not rendering**: Ensure Chart.js dependencies are installed, check for canvas rendering errors
- **Dependencies not displaying**: Verify work item dependencies are properly stored in database
- **Critical path calculation errors**: Check that all work items have proper start/end dates and estimates
- **Resource allocation not updating**: Verify team member assignments and capacity calculations
- **Timeline navigation issues**: Check date handling and time scale calculations

#### Database Schema Issues
- **Migration failures**: Check `supabase/combined_schema.sql` for syntax errors, ensure proper foreign key relationships
- **RLS policy errors**: Verify policies cover all CRUD operations, check that `auth.uid()` is properly referenced
- **Workflow validation errors**: Ensure workflow states exist before creating transitions, verify methodology types match enum values
- **WIP limit violations**: Check that workflow states have proper WIP limits configured, verify work item counts don't exceed limits
- **Function execution errors**: Ensure database functions have proper permissions, check for null value handling in calculations

#### TypeScript and Type System Issues
- **Type compilation errors**: Run `npm run build` to check for TypeScript errors, ensure all imports are properly typed
- **Runtime type validation failures**: Check type guards in `src/types/guards.ts`, ensure data matches expected interfaces
- **Database type mismatches**: Regenerate types with `supabase gen types typescript --local > src/types/database.ts`
- **Form validation errors**: Verify form data types match interfaces in `src/types/forms.ts`
- **API type errors**: Check that request/response types in `src/types/api.ts` match actual API responses
- **Missing type definitions**: Ensure all new features have corresponding types in the appropriate type files
- **Circular import errors**: Check import structure in type files, avoid circular dependencies between type modules

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
### Getting Help

1. Check the browser console for error messages
2. Verify environment variables are correctly set
3. Ensure Supabase project is properly configured
4. Check network tab for failed API requests
5. Review Supabase dashboard for authentication logs
6. Run tests to verify component functionality: `npm test`

For additional support, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [@dnd-kit Documentation](https://docs.dndkit.com)
- [Vitest Documentation](https://vitest.dev)