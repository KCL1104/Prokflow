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
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.ts
```

## Troubleshooting

### Common Issues

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