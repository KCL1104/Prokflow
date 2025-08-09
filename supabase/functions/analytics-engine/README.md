# Analytics Engine Edge Function

This Supabase Edge Function provides advanced analytics and metrics calculations for the project management platform.

## Features

- **Burndown Charts**: Generate sprint burndown data with ideal vs actual progress
- **Velocity Analysis**: Calculate team velocity trends and consistency
- **Cycle Time Analytics**: Analyze work item cycle and lead times
- **Team Performance**: Individual and team performance metrics
- **Project Health**: Overall project health scoring and indicators
- **Sprint Metrics**: Comprehensive sprint performance analysis
- **Workload Distribution**: Analyze work distribution across team members
- **Completion Trends**: Track completion patterns over time
- **Authentication**: Integrated with Supabase Auth
- **CORS Support**: Proper CORS handling for web applications

## Deployment

To deploy this Edge Function to Supabase:

```bash
supabase functions deploy analytics-engine
```

## Usage

### Request Format

```typescript
interface AnalyticsRequest {
  action: 'burndown-chart' | 'velocity-analysis' | 'cycle-time' | 'team-performance' | 'project-health' | 'sprint-metrics' | 'workload-distribution' | 'completion-trends';
  projectId?: string;
  sprintId?: string;
  userId?: string;
  teamId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  options?: {
    sprintCount?: number;
    includeSubtasks?: boolean;
    groupBy?: 'day' | 'week' | 'month';
    workItemTypes?: string[];
  };
}
```

### Response Format

```typescript
interface AnalyticsResponse {
  data: any;
  success: boolean;
}
```

## Supported Analytics

### 1. Burndown Chart

Generate burndown chart data for a sprint.

```javascript
const response = await fetch('/functions/v1/analytics-engine', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'burndown-chart',
    sprintId: 'sprint-id'
  })
});

// Response includes:
// - Daily remaining points
// - Ideal burndown line
// - Actual progress
// - Completion trends
```

### 2. Velocity Analysis

Analyze team velocity over multiple sprints.

```javascript
const response = await fetch('/functions/v1/analytics-engine', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'velocity-analysis',
    projectId: 'project-id',
    options: {
      sprintCount: 10
    }
  })
});

// Response includes:
// - Velocity data per sprint
// - Average velocity
// - Velocity trend (up/down/stable)
// - Consistency score
```

### 3. Cycle Time Analysis

Analyze work item cycle and lead times.

```javascript
const response = await fetch('/functions/v1/analytics-engine', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'cycle-time',
    projectId: 'project-id',
    dateRange: {
      start: '2024-01-01',
      end: '2024-01-31'
    },
    options: {
      workItemTypes: ['story', 'task', 'bug']
    }
  })
});

// Response includes:
// - Individual work item cycle times
// - Average cycle and lead times
// - Time distribution analysis
// - Stage-wise time breakdown
```

### 4. Team Performance

Analyze individual and team performance metrics.

```javascript
const response = await fetch('/functions/v1/analytics-engine', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'team-performance',
    projectId: 'project-id',
    dateRange: {
      start: '2024-01-01',
      end: '2024-01-31'
    }
  })
});

// Response includes:
// - Individual team member metrics
// - Completed items and points
// - Average cycle times
// - On-time delivery rates
// - Quality scores
```

### 5. Project Health

Get overall project health indicators.

```javascript
const response = await fetch('/functions/v1/analytics-engine', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'project-health',
    projectId: 'project-id'
  })
});

// Response includes:
// - Overall health score
// - Velocity indicators
// - Quality metrics
// - Delivery performance
// - Team health indicators
```

### 6. Sprint Metrics

Get comprehensive sprint performance metrics.

```javascript
const response = await fetch('/functions/v1/analytics-engine', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'sprint-metrics',
    sprintId: 'sprint-id'
  })
});

// Response includes:
// - Sprint information
// - Completion metrics
// - Velocity achieved
// - Scope changes
// - Daily progress data
```

### 7. Workload Distribution

Analyze work distribution across team members.

```javascript
const response = await fetch('/functions/v1/analytics-engine', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'workload-distribution',
    projectId: 'project-id',
    dateRange: {
      start: '2024-01-01',
      end: '2024-01-31'
    }
  })
});

// Response includes:
// - Distribution by assignee
// - Distribution by work item type
// - Distribution by priority
// - Utilization metrics
```

### 8. Completion Trends

Analyze completion patterns over time.

```javascript
const response = await fetch('/functions/v1/analytics-engine', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'completion-trends',
    projectId: 'project-id',
    options: {
      groupBy: 'week'
    }
  })
});

// Response includes:
// - Completion trends by period
// - Created vs completed items
// - Net progress indicators
// - Productivity trends
```

## Data Models

### Burndown Data
```typescript
interface BurndownData {
  date: string;
  remainingPoints: number;
  idealRemaining: number;
  completedPoints: number;
  totalPoints: number;
}
```

### Velocity Data
```typescript
interface VelocityData {
  sprintName: string;
  sprintNumber: number;
  completedPoints: number;
  committedPoints: number;
  completionRate: number;
  startDate: string;
  endDate: string;
}
```

### Cycle Time Data
```typescript
interface CycleTimeData {
  workItemId: string;
  title: string;
  type: string;
  cycleTime: number; // in days
  leadTime: number; // in days
  createdAt: string;
  completedAt: string;
  stages: {
    stage: string;
    duration: number;
    startTime: string;
    endTime: string;
  }[];
}
```

## Environment Variables

The function requires the following environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Database Functions Required

This function relies on several database functions that should be created:

- `generate_burndown_data(p_sprint_id)`
- `analyze_velocity(p_project_id, p_sprint_count)`
- `analyze_cycle_time(p_project_id, p_start_date, p_end_date, p_work_item_types)`
- `analyze_team_performance(p_project_id, p_start_date, p_end_date)`
- `analyze_project_health(p_project_id)`
- `get_sprint_metrics(p_sprint_id)`
- `analyze_workload_distribution(p_project_id, p_start_date, p_end_date)`
- `analyze_completion_trends(p_project_id, p_group_by)`

## Error Handling

The function returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (missing parameters, invalid action)
- `401`: Unauthorized (invalid or missing authentication)
- `500`: Internal Server Error

Error responses include detailed error messages:

```json
{
  "error": "Error description",
  "details": "Additional error details"
}
```

## Performance Considerations

- Complex analytics are computed using database functions for efficiency
- Results can be cached for frequently requested metrics
- Date range filtering reduces computation overhead
- Pagination support for large datasets

## Security

- All requests require valid Supabase authentication
- Input validation prevents injection attacks
- Row Level Security (RLS) policies are enforced
- Project-level access control ensures data isolation

## Future Enhancements

- Real-time analytics updates
- Custom metric definitions
- Predictive analytics
- Benchmark comparisons
- Export capabilities
- Scheduled analytics reports