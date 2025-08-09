<<<<<<< HEAD
# Supabase Database Setup

This directory contains the database schema, migrations, and configuration for the Project Management Platform.

## Implementation Status

✅ **Complete Database Schema** - All core tables implemented with proper relationships
✅ **Row Level Security (RLS)** - Comprehensive security policies for all tables  
✅ **Authentication Setup** - Email/password and social OAuth fully configured and tested
✅ **Default Workflows** - Pre-configured workflows for Scrum, Kanban, Waterfall
✅ **Database Functions** - Business logic functions for validation and calculations
✅ **Real-time Configuration** - Optimized for live updates and collaboration
✅ **Service Layer Integration** - All services properly integrated with database schema

## Prerequisites

1. Install Supabase CLI: https://supabase.com/docs/guides/cli
2. Docker Desktop (for local development)

## Local Development Setup

1. **Initialize Supabase locally:**
   ```bash
   supabase start
   ```

2. **Apply migrations:**
   ```bash
   supabase db reset
   ```

3. **View local Supabase Studio:**
   - Open http://localhost:54323 in your browser
   - Use the local database credentials shown in the terminal

## Database Schema Overview

### Core Tables

- **users**: Extended user profiles (linked to auth.users)
- **workflows**: Workflow definitions for different methodologies
- **workflow_states**: Individual states within workflows
- **workflow_transitions**: Valid state transitions
- **projects**: Project metadata and settings
- **project_members**: Team membership and roles
- **sprints**: Sprint planning and tracking
- **work_items**: Tasks, stories, bugs, and epics
- **work_item_dependencies**: Task dependencies
- **comments**: Work item discussions
- **attachments**: File attachments

### Default Workflows

The system includes pre-configured workflows for:

1. **Scrum**: To Do → In Progress → In Review → Done
2. **Kanban**: Backlog → Ready → In Progress → Review → Done (with WIP limits)
3. **Waterfall**: Requirements → Design → Implementation → Testing → Deployment → Maintenance
4. **Custom**: Basic template for custom workflows

### Database Functions

- `validate_workflow_transition()`: Validates state transitions
- `get_available_transitions()`: Gets valid next states for a work item
- `check_wip_limit()`: Enforces WIP limits
- `calculate_sprint_velocity()`: Calculates team velocity
- `get_sprint_burndown()`: Generates burndown chart data
- `get_project_metrics()`: Provides project analytics

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access projects they're members of
- Project owners and admins have additional permissions
- Default workflows are publicly readable
- Custom workflows are project-specific

## Authentication Setup

### ✅ Email/Password Authentication

Fully implemented and tested with:
- User registration with email verification
- Secure login with proper validation
- Password reset functionality with email flow
- Form validation and comprehensive error handling
- Email confirmation required for new accounts
- User profile management with timezone and avatar support

### ✅ Social Authentication

**Fully configured and tested providers:**
- Google OAuth (complete implementation with proper scopes)
- GitHub OAuth (complete implementation with user data)

The application includes complete social authentication flows with:
- Proper error handling and user feedback
- Seamless user experience with loading states
- Automatic user profile creation
- Session management and token refresh

**Setup for Production:**

1. **Google OAuth Setup:**
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Set authorized redirect URIs to include your Supabase auth callback
   - Add client ID and secret to Supabase dashboard

2. **GitHub OAuth Setup:**
   - Go to GitHub Developer Settings
   - Create a new OAuth App
   - Set authorization callback URL to your Supabase auth callback
   - Add client ID and secret to Supabase dashboard

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Required - Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note:** OAuth provider credentials are configured in the Supabase dashboard, not as environment variables in the frontend application. This is the recommended secure approach.

## Production Deployment

1. **Create Supabase Project:**
   - Go to https://supabase.com/dashboard
   - Create a new project
   - Note the project URL and anon key

2. **Apply Migrations:**
   ```bash
   supabase db push
   ```

3. **Configure Authentication:**
   - In Supabase Dashboard → Authentication → Settings
   - Configure site URL and redirect URLs
   - Enable desired auth providers
   - Add OAuth credentials

4. **Set up Environment Variables:**
   - Update your deployment environment with production Supabase credentials

## Migration Commands

```bash
# Create a new migration
supabase migration new migration_name

# Apply migrations to local database
supabase db reset

# Apply migrations to remote database
=======
# Supabase Database Documentation

This directory contains the database schema, migrations, and configuration for the Project Management Platform.

## Database Architecture

### Schema Overview

The database uses a comprehensive schema that supports multiple project management methodologies (Scrum, Kanban, Waterfall, Custom) with real-time collaboration features.

### Core Tables

#### User Management
- `users` - User profiles and authentication data
- `user_invitations` - Team member invitation system

#### Project Management
- `projects` - Project definitions with methodology support
- `project_members` - Team membership with role-based access
- `workflows` - Customizable workflow definitions
- `workflow_states` - Individual workflow states with WIP limits

#### Work Management
- `work_items` - Tasks, stories, bugs, and epics
- `work_item_dependencies` - Task dependency relationships
- `work_item_comments` - Collaborative commenting system
- `work_item_attachments` - File attachment support

#### Sprint Management
- `sprints` - Sprint planning and execution
- `sprint_work_items` - Work item assignments to sprints

#### Daily Standups
- `standups` - Daily standup scheduling and management
- `standup_participants` - Team member participation tracking
- `standup_reminders` - Automated reminder system

#### Sprint Retrospectives
- `retrospectives` - Sprint retrospective sessions
- `retrospective_templates` - Customizable retrospective formats
- `retrospective_feedback` - Team feedback collection with voting
- `retrospective_action_items` - Action item tracking and follow-up

### Migration Files

1. **001_initial_schema.sql** - Core tables and user management
2. **002_workflow_system.sql** - Workflow engine and state management
3. **003_work_items.sql** - Work item management and dependencies
4. **004_sprint_management.sql** - Sprint planning and execution
5. **005_standup_tables.sql** - Daily standup management system
6. **006_retrospective_tables.sql** - Sprint retrospective functionality
7. **007_reporting_functions.sql** - Analytics and reporting functions
8. **014_analytics_functions.sql** - Advanced analytics functions (⚠️ **In Progress** - requires completion)

### Key Features

#### Multi-Methodology Support
- **Scrum**: Complete sprint management with burndown tracking
- **Kanban**: Continuous flow with WIP limits
- **Waterfall**: Phase-based project management
- **Custom**: Flexible workflow definitions

#### Security Model
- **Row Level Security (RLS)**: Comprehensive policies on all tables
- **Role-Based Access**: Project-scoped permissions (Owner, Admin, Member, Viewer)
- **Data Isolation**: Users can only access their project data

#### Business Logic Functions
- **Workflow Validation**: Database-level state transition validation
- **Sprint Analytics**: Velocity calculations and burndown data generation
- **Project Metrics**: Automated metric calculations and reporting
- **Dependency Management**: Circular dependency prevention

#### Performance Optimization
- **Strategic Indexing**: Optimized for common query patterns
- **Real-time Support**: Optimized for Supabase Realtime subscriptions
- **Batch Operations**: Efficient bulk update operations

## Local Development Setup

### Prerequisites
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- Docker Desktop running (for local Supabase stack)

### Setup Commands

```bash
# Start local Supabase stack
supabase start

# Check service status
supabase status

# Reset database with all migrations
supabase db reset

# Apply new migrations
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.ts
<<<<<<< HEAD
```

=======

# Stop local stack
supabase stop
```

### Environment Configuration

The local Supabase stack provides:
- **Database**: PostgreSQL with all migrations applied
- **Auth**: Local authentication service
- **API**: Auto-generated REST and GraphQL APIs
- **Realtime**: WebSocket connections for live updates
- **Storage**: File upload and management

Local services run on:
- API URL: `http://localhost:54321`
- Database URL: `postgresql://postgres:postgres@localhost:54322/postgres`
- Studio: `http://localhost:54323`

## Database Schema Details

### Retrospective System (Migration 006)

The retrospective system provides comprehensive sprint retrospective functionality:

#### Tables
- **retrospective_templates**: Customizable retrospective formats
  - Pre-configured templates: "Start, Stop, Continue", "What Went Well/Didn't Go Well/Action Items", "Mad, Sad, Glad"
  - Custom categories with colors and descriptions
  - Default template system

- **retrospectives**: Sprint retrospective sessions
  - Linked to specific sprints and projects
  - Facilitator assignment and participant tracking
  - Status tracking (draft, in_progress, completed)
  - Scheduled date and completion tracking

- **retrospective_feedback**: Team feedback collection
  - Categorized feedback (went_well, needs_improvement, action_items)
  - Voting system for feedback prioritization
  - User attribution and timestamps

- **retrospective_action_items**: Action item tracking
  - Assignee management and due dates
  - Priority levels and status tracking
  - Follow-up management across sprints

#### Key Features
- **Template System**: Flexible retrospective formats with custom categories
- **Voting Mechanism**: Team-based feedback prioritization
- **Action Item Tracking**: Convert insights into trackable tasks
- **Sprint Integration**: Seamless integration with sprint lifecycle
- **Access Control**: Project-scoped access with RLS policies

### Standup System (Migration 005)

Complete daily standup management system:

#### Tables
- **standups**: Standup scheduling and configuration
- **standup_participants**: Individual participation tracking
- **standup_reminders**: Automated reminder system

#### Features
- **Flexible Scheduling**: Daily, weekly, or custom schedules
- **Participation Tracking**: Yesterday/Today/Blockers format
- **Reminder System**: Multiple notification types with escalation
- **Sprint Integration**: Link standups to active sprints
- **Team Management**: Facilitator assignment and participant management

### Work Item System (Migration 003)

Comprehensive work item management:

#### Features
- **Multiple Types**: Stories, tasks, bugs, epics
- **Dependency Management**: Task relationships with circular dependency prevention
- **Status Tracking**: Customizable workflow states
- **Estimation**: Story points and time tracking
- **Collaboration**: Comments, attachments, and activity history

### Sprint Management (Migration 004)

Complete sprint lifecycle support:

#### Features
- **Sprint Planning**: Capacity-based planning with velocity tracking
- **Burndown Analytics**: Real-time progress tracking
- **Work Item Assignment**: Flexible sprint backlog management
- **Completion Workflow**: Automated handling of incomplete items

## Production Deployment

### Migration Strategy
1. **Incremental Migrations**: Each migration builds on the previous
2. **Rollback Support**: All migrations include rollback procedures
3. **Data Validation**: Built-in validation functions prevent data corruption
4. **Performance Testing**: Migrations tested with large datasets

### Monitoring and Maintenance
- **Query Performance**: Regular analysis of slow queries
- **Index Optimization**: Periodic index usage analysis
- **Data Growth**: Monitoring table sizes and growth patterns
- **Security Audits**: Regular review of RLS policies and permissions

## API Integration

### Generated APIs
Supabase automatically generates:
- **REST API**: Full CRUD operations for all tables
- **GraphQL API**: Flexible querying with relationships
- **Realtime API**: WebSocket subscriptions for live updates

### Custom Functions
- **Workflow Validation**: `validate_workflow_transition()`
- **Sprint Analytics**: `get_sprint_burndown_data()`
- **Project Metrics**: `calculate_project_velocity()`
- **Feedback Voting**: `vote_retrospective_feedback()`

### Security
- **RLS Policies**: Comprehensive row-level security
- **API Keys**: Separate keys for different environments
- **Rate Limiting**: Built-in API rate limiting
- **CORS Configuration**: Proper cross-origin request handling

### Analytics Functions (Migration 014) - ⚠️ In Progress

A new migration file has been created for advanced analytics functions:

#### Purpose
- **Cycle Time Analysis**: Functions to analyze work item cycle times and lead times
- **Velocity Analytics**: Sprint velocity calculations with trend analysis
- **Burndown Data Generation**: Enhanced burndown chart data processing
- **Distribution Analysis**: Work item completion time distribution metrics

#### Current Status
- Migration file created but requires completion
- Functions need proper SQL syntax and implementation
- Integration with reporting system pending

#### Planned Functions
- `analyze_cycle_time()` - Cycle time analysis with distribution data
- `analyze_velocity()` - Sprint velocity trends and consistency metrics  
- `generate_burndown_data()` - Enhanced burndown chart data generation
- Additional analytics functions for comprehensive reporting

#### Next Steps
1. Complete SQL function implementations
2. Add proper error handling and validation
3. Test functions with realistic data sets
4. Integrate with frontend reporting components
5. Add comprehensive documentation and examples

>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
## Troubleshooting

### Common Issues

<<<<<<< HEAD
1. **Migration Errors:**
   - Check for syntax errors in SQL files
   - Ensure proper foreign key relationships
   - Verify enum types are created before use

2. **RLS Policy Issues:**
   - Test policies with different user roles
   - Check that auth.uid() is properly referenced
   - Ensure policies cover all CRUD operations

3. **Authentication Issues:**
   - Verify OAuth redirect URLs match exactly
   - Check that environment variables are properly set
   - Ensure auth providers are enabled in Supabase dashboard

### Useful Commands

```bash
# View local database logs
supabase logs

# Reset local database
supabase db reset

# Generate new migration from schema diff
supabase db diff --use-migra

# Test RLS policies
supabase test db
```
=======
#### Migration Failures
```bash
# Check migration status
supabase migration list

# Repair migrations
supabase db reset --debug

# Manual migration application
supabase db push --debug

# Fix corrupted migration files
# Edit the migration file directly and reapply
supabase db reset
```

#### Type Generation Issues
```bash
# Regenerate types after schema changes
supabase gen types typescript --local > src/types/database.ts

# Verify type generation
npm run type-check
```

#### Local Development Issues
```bash
# Check Docker status
docker ps

# Restart Supabase stack
supabase stop
supabase start

# Check logs
supabase logs
```

### Performance Optimization

#### Query Optimization
- Use appropriate indexes for frequent queries
- Leverage RLS policies for data filtering
- Use batch operations for bulk updates
- Implement proper pagination for large datasets

#### Real-time Optimization
- Subscribe only to necessary tables and columns
- Use filters to reduce subscription payload
- Implement proper connection management
- Handle connection failures gracefully

## Contributing

### Adding New Migrations
1. Create new migration file: `supabase migration new migration_name`
2. Write migration SQL with proper rollback procedures
3. Test migration locally: `supabase db reset`
4. Update combined schema if needed
5. Generate new TypeScript types
6. Update documentation

### Current Migration Issues
- **Migration 014**: `014_analytics_functions.sql` contains corrupted content and needs to be rewritten
- The file appears to have garbled SQL syntax that will cause migration failures
- Recommended action: Rewrite the migration with proper SQL functions for analytics

### Schema Changes
- Always use migrations for schema changes
- Include proper indexes for new tables
- Add RLS policies for new tables
- Update TypeScript types after changes
- Test with realistic data volumes

### Best Practices
- Use descriptive migration names
- Include comments in complex SQL
- Test migrations with production-like data
- Verify RLS policies work correctly
- Update documentation with schema changes
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
