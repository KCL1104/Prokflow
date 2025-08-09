---
inclusion: always
---

# Technology Stack & Development Guidelines

## Core Technologies

### Frontend Stack

- **React 19** with TypeScript - Use functional components with hooks exclusively
- **Vite** - Build tool with HMR, use `npm run dev` for development
- **Tailwind CSS v4.1.11** - Utility-first styling, mobile-first responsive design
- **SWC** - Fast compilation via @vitejs/plugin-react-swc
- **React Router v6** - Client-side routing with protected routes and project-specific paths
<<<<<<< HEAD
- **@dnd-kit** - Drag-and-drop functionality with accessibility support
- **Vitest** - Testing framework with React Testing Library integration
=======
- **@dnd-kit** - Drag-and-drop functionality with accessibility support (core, sortable, utilities, modifiers)
- **Vitest** - Testing framework with React Testing Library integration
- **Chart.js** - Data visualization for burndown charts, velocity metrics, and analytics
- **D3.js** - Advanced visualizations for Gantt charts and resource allocation
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

### Backend & Database

- **Supabase** - Primary backend (PostgreSQL + Auth + Real-time + Storage)
- **PostgreSQL 15** - Use Row Level Security (RLS) for all tables with comprehensive policies
- **Supabase Auth** - JWT tokens (1-hour expiry), supports GitHub/Google OAuth + email/password
<<<<<<< HEAD
- **Database Schema** - Complete schema with proper relationships, indexes, and constraints
=======
- **Database Schema** - Complete unified schema in `supabase/combined_schema.sql` with:
  - Multi-methodology workflow support (Scrum, Kanban, Waterfall, Custom)
  - Sprint management with burndown analytics
  - Daily standup and retrospective systems
  - Comprehensive audit trails and business logic functions
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
- **Real-time subscriptions** - Planned for collaborative features (task 15)
- **Edge Functions** - Planned for complex business logic and report generation

## Development Standards

### TypeScript Requirements

- Strict mode enabled - no `any` types allowed
- ES2022 target with DOM libraries
<<<<<<< HEAD
- Use proper type definitions in `src/types/`
- Interface over type aliases for object shapes
=======
- Comprehensive type system organized in `src/types/`:
  - `database.ts` - Generated Supabase types
  - `index.ts` - Core domain types (Project, WorkItem, Sprint, etc.)
  - `forms.ts` - Form validation and input types
  - `api.ts` - API request/response types
  - `charts.ts` - Data visualization types
  - `guards.ts` - Runtime type validation functions
  - `utils.ts` - Generic utility types
- Interface over type aliases for object shapes
- Runtime type validation using type guards for data integrity
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

### Code Quality

- **ESLint** with TypeScript and React plugins - fix all warnings before commits
- **PostCSS** with Autoprefixer for CSS processing
- **React.memo()** for expensive renders (drag-and-drop lists, large datasets)
<<<<<<< HEAD
- **Error boundaries** implemented for graceful error handling
- **Loading states** with proper skeletons and user feedback
- **Accessibility** compliance with ARIA labels, keyboard navigation, and screen reader support
- **Type guards** for runtime type validation and safety
=======
- **Error boundaries** implemented for graceful error handling with custom error classes
- **Loading states** with proper skeletons and user feedback
- **Accessibility** compliance with ARIA labels, keyboard navigation, and screen reader support
- **Type guards** for runtime type validation and safety in `src/types/guards.ts`
- **Custom error handling** system with structured error classes and user-friendly messages
- **Comprehensive testing** with 89.6% pass rate and co-located test files
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

### Environment Setup

- Copy `.env.example` to `.env.local`
- Required variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Never commit `.env.local` or expose secrets in client code

## Development Workflow

### Commands

```bash
npm run dev          # Development server (localhost:5173)
npm run build        # Production build with TypeScript check
npm run preview      # Preview production build
npm run lint         # ESLint validation
npm test             # Run Vitest test suite
npm test -- --ui     # Run tests with UI interface
```

### Supabase Local Development

```bash
supabase start       # Start local stack
supabase stop        # Stop services
supabase status      # Check service status
supabase db reset    # Reset local database with migrations
supabase db push     # Push migrations to remote database
```

### Testing Workflow

- **Unit tests**: Run automatically on file changes during development
- **Integration tests**: Test complete user workflows and component interactions
<<<<<<< HEAD
- **Test coverage**: Monitor coverage reports and maintain high coverage for critical paths
- **Mock strategy**: Use Vitest mocks for external dependencies (Supabase, react-router-dom)
=======
- **Test coverage**: Monitor coverage reports and maintain high coverage for critical paths (current: 89.6% pass rate)
- **Mock strategy**: Use Vitest mocks for external dependencies (Supabase, react-router-dom)
- **Test organization**: Co-located in `__tests__` folders with comprehensive component and service testing
- **Test utilities**: Centralized setup in `src/setupTests.ts` with global mocks and utilities
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

## Technical Constraints

### Performance

- **Lazy loading**: Heavy components (Gantt charts, large datasets) loaded on demand
<<<<<<< HEAD
- **Optimistic updates**: Implemented for better UX with proper error recovery
- **Efficient drag-and-drop**: Using @dnd-kit with proper virtualization for large lists
- **Batch operations**: Bulk updates implemented to reduce API calls
- **Code splitting**: Vite handles automatic code splitting by route
=======
- **Optimistic updates**: Implemented for better UX with proper error recovery (backlog, boards)
- **Efficient drag-and-drop**: Using @dnd-kit with proper virtualization for large lists
- **Batch operations**: Bulk updates implemented to reduce API calls (backlog bulk edit)
- **Code splitting**: Vite handles automatic code splitting by route
- **React.memo()**: Applied to expensive components (drag-and-drop interfaces, chart components)
- **Debounced operations**: Search and filtering with performance optimization
- **Strategic indexing**: Database indexes for optimal query performance
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

### Security

- **RLS policies**: All database access through comprehensive Row Level Security policies
- **Input validation**: Client-side validation with server-side enforcement
- **Authentication**: Supabase Auth for all authentication flows with proper token handling
- **Environment variables**: Sensitive data properly managed through environment variables
- **Type safety**: TypeScript strict mode prevents common security vulnerabilities

### Browser Support

- **Modern browsers**: ES2022 support required (Chrome 94+, Firefox 93+, Safari 15+)
- **Mobile-first**: Responsive design with touch-friendly interactions
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support
- **Progressive enhancement**: Core functionality works without JavaScript where possible

### Development Constraints

- **No `any` types**: Strict TypeScript enforcement
- **Component co-location**: Tests, styles, and utilities kept with components
- **Error handling**: All async operations must have proper error boundaries
- **Loading states**: All data fetching must show appropriate loading indicators
<<<<<<< HEAD
=======

## Advanced Development Patterns

### Error Handling Architecture

- **Custom error classes**: Structured error hierarchy in `src/utils/errors.ts`
  - `AppError` - Base application error class
  - `ValidationError` - Form and input validation errors
  - `AuthenticationError` - Authentication and authorization errors
  - `DatabaseError` - Database operation errors
  - `NetworkError` - API and network-related errors
- **Error boundaries**: React error boundaries for graceful failure handling
- **useErrorHandler hook**: Centralized error handling with user-friendly messages
- **Supabase error mapping**: Automatic conversion of database errors to application errors

### State Management Patterns

- **Local state**: Component-level state for UI concerns (modals, form inputs)
- **Custom hooks**: Business logic encapsulation (useBacklogOperations, useStandups)
- **Context providers**: Global state for authentication and project context
- **Optimistic updates**: Immediate UI feedback with error recovery
- **State normalization**: Consistent data structures across components

### Component Architecture

- **Compound components**: Complex UI broken into composable parts
- **Render props**: Flexible component composition patterns
- **Higher-order components**: Cross-cutting concerns (authentication, error handling)
- **Custom hooks**: Reusable stateful logic extraction
- **Provider patterns**: Context-based state sharing

### Data Fetching Patterns

- **Service layer**: Direct Supabase client operations with error handling
- **Custom hooks**: Data fetching logic encapsulation
- **Loading states**: Consistent loading indicators across the application
- **Error recovery**: Retry mechanisms and fallback states
- **Cache management**: Efficient data caching and invalidation

## Database Development Standards

### Schema Management

- **Migration-based**: All schema changes through Supabase migrations
- **Version control**: Database schema tracked in version control
- **Rollback support**: Reversible migrations for safe deployments
- **Documentation**: Schema documentation in `supabase/README.md`

### Query Optimization

- **Strategic indexing**: Indexes for frequently queried columns
- **Query analysis**: Regular performance analysis of database queries
- **Batch operations**: Bulk operations to reduce database round trips
- **Connection pooling**: Efficient database connection management

### Security Implementation

- **Row Level Security**: Comprehensive RLS policies for all tables
- **Function security**: Database functions with proper permission checks
- **Input validation**: Server-side validation for all database operations
- **Audit logging**: Comprehensive audit trails for sensitive operations

## Testing Architecture

### Test Organization

- **Co-located tests**: Tests placed with components in `__tests__` folders
- **Test utilities**: Shared test setup and utilities in `src/setupTests.ts`
- **Mock consistency**: Standardized mocking patterns across test suites
- **Test data**: Consistent test data factories and fixtures

### Testing Patterns

- **Unit testing**: Individual component and function testing
- **Integration testing**: Component interaction and workflow testing
- **Snapshot testing**: UI consistency verification
- **Accessibility testing**: WCAG compliance verification

### Quality Metrics

- **Coverage tracking**: Code coverage monitoring and reporting
- **Performance testing**: Component render performance testing
- **Error testing**: Error boundary and error handling testing
- **User workflow testing**: End-to-end user journey testing

## Deployment and DevOps

### Build Process

- **TypeScript compilation**: Strict type checking in build process
- **ESLint validation**: Code quality checks before deployment
- **Test execution**: Automated test running in CI/CD pipeline
- **Bundle analysis**: Regular bundle size monitoring and optimization

### Environment Management

- **Environment separation**: Clear separation of development, staging, and production
- **Configuration management**: Environment-specific configuration handling
- **Secret management**: Secure handling of API keys and sensitive data
- **Database migrations**: Automated migration deployment process

### Monitoring and Observability

- **Error tracking**: Application error monitoring and alerting
- **Performance monitoring**: Application performance metrics tracking
- **User analytics**: User interaction and feature usage tracking
- **Database monitoring**: Database performance and query analysis
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
