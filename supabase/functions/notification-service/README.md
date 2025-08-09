# Notification Service Edge Function

This Supabase Edge Function provides comprehensive notification management capabilities for the project management platform.

## Features

- **Notification Creation**: Create individual and bulk notifications
- **User Notifications**: Retrieve user-specific notifications with pagination
- **Read Status Management**: Mark notifications as read (individual or all)
- **Notification Deletion**: Remove notifications
- **Unread Count**: Get count of unread notifications
- **Real-time Delivery**: Send notifications via Supabase Realtime
- **Authentication**: Integrated with Supabase Auth
- **CORS Support**: Proper CORS handling for web applications

## Deployment

To deploy this Edge Function to Supabase:

```bash
supabase functions deploy notification-service
```

## Usage

### Request Format

```typescript
interface NotificationRequest {
  action: 'create' | 'get-user-notifications' | 'mark-read' | 'mark-all-read' | 'delete' | 'get-unread-count' | 'send-bulk';
  notificationId?: string;
  userId?: string;
  data?: {
    type?: 'work_item_assigned' | 'work_item_updated' | 'sprint_started' | 'sprint_ended' | 'comment_added' | 'mention' | 'deadline_reminder' | 'project_invitation';
    title?: string;
    message?: string;
    projectId?: string;
    workItemId?: string;
    sprintId?: string;
    metadata?: Record<string, unknown>;
    recipients?: string[];
    notifications?: NotificationData[];
    page?: number;
    limit?: number;
  };
}
```

### Response Format

```typescript
interface NotificationResponse {
  data: any;
  success: boolean;
}
```

## Supported Actions

### 1. Create Notification

Create a single notification for a user.

```javascript
const response = await fetch('/functions/v1/notification-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'create',
    userId: 'user-id',
    data: {
      type: 'work_item_assigned',
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: "Implement user authentication"',
      projectId: 'project-id',
      workItemId: 'work-item-id',
      metadata: {
        priority: 'high',
        dueDate: '2024-01-15'
      }
    }
  })
});
```

### 2. Get User Notifications

Retrieve notifications for a specific user with pagination.

```javascript
const response = await fetch('/functions/v1/notification-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'get-user-notifications',
    userId: 'user-id',
    data: {
      page: 1,
      limit: 20
    }
  })
});
```

### 3. Mark Notification as Read

Mark a specific notification as read.

```javascript
const response = await fetch('/functions/v1/notification-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'mark-read',
    notificationId: 'notification-id'
  })
});
```

### 4. Mark All Notifications as Read

Mark all unread notifications for a user as read.

```javascript
const response = await fetch('/functions/v1/notification-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'mark-all-read',
    userId: 'user-id'
  })
});
```

### 5. Delete Notification

Remove a specific notification.

```javascript
const response = await fetch('/functions/v1/notification-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'delete',
    notificationId: 'notification-id'
  })
});
```

### 6. Get Unread Count

Get the count of unread notifications for a user.

```javascript
const response = await fetch('/functions/v1/notification-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'get-unread-count',
    userId: 'user-id'
  })
});
```

### 7. Send Bulk Notifications

Create multiple notifications at once.

```javascript
const response = await fetch('/functions/v1/notification-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'send-bulk',
    data: {
      notifications: [
        {
          type: 'sprint_started',
          title: 'Sprint Started',
          message: 'Sprint "Q1 Development" has started',
          userId: 'user-1',
          projectId: 'project-id',
          sprintId: 'sprint-id'
        },
        {
          type: 'sprint_started',
          title: 'Sprint Started',
          message: 'Sprint "Q1 Development" has started',
          userId: 'user-2',
          projectId: 'project-id',
          sprintId: 'sprint-id'
        }
      ]
    }
  })
});
```

## Notification Types

The service supports the following notification types:

- `work_item_assigned`: When a work item is assigned to a user
- `work_item_updated`: When a work item is updated
- `sprint_started`: When a sprint begins
- `sprint_ended`: When a sprint ends
- `comment_added`: When a comment is added to a work item
- `mention`: When a user is mentioned in a comment
- `deadline_reminder`: Reminder about approaching deadlines
- `project_invitation`: When a user is invited to a project

## Environment Variables

The function requires the following environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

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

## Database Schema Requirements

This function expects the following database table:

- `notifications`: Main notifications table with columns:
  - `id`: Primary key
  - `type`: Notification type
  - `title`: Notification title
  - `message`: Notification message
  - `user_id`: Target user ID
  - `project_id`: Related project ID (optional)
  - `work_item_id`: Related work item ID (optional)
  - `sprint_id`: Related sprint ID (optional)
  - `metadata`: Additional data (JSON)
  - `is_read`: Read status
  - `created_at`: Creation timestamp

## Real-time Features

The service integrates with Supabase Realtime to send notifications instantly:

- Notifications are broadcast to user-specific channels
- Real-time delivery ensures immediate notification updates
- Fallback handling for failed real-time delivery

## Performance Considerations

- Pagination support for large notification lists
- Bulk operations for efficient mass notifications
- Indexed database queries for fast retrieval
- Real-time channels are user-specific to reduce overhead

## Security

- All requests require valid Supabase authentication
- Input validation prevents injection attacks
- Row Level Security (RLS) policies are enforced
- User isolation ensures notifications are only accessible by intended recipients

## Future Enhancements

- Email notification delivery
- Push notification support
- Notification templates
- Delivery preferences per user
- Notification scheduling
- Analytics and delivery tracking