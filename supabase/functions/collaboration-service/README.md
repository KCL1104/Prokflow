# Collaboration Service Edge Function

A Supabase Edge Function that provides real-time collaboration features for the Kiro Pro project management platform.

## Features

- **Collaborative Sessions**: Create and manage real-time collaboration sessions
- **User Presence**: Track active users and their current status
- **Real-time Cursor Tracking**: Share cursor positions between collaborators
- **Selection Sharing**: Broadcast text/element selections to other users
- **Session Management**: Join, leave, and end collaborative sessions
- **Live User Lists**: Get active users in projects and sessions
- **Authentication**: Secure access with Supabase Auth
- **CORS Support**: Cross-origin resource sharing enabled

## Deployment

```bash
# Deploy the function
supabase functions deploy collaboration-service

# Set environment variables
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_ANON_KEY=your_anon_key
```

## Usage

### Request Format

```typescript
interface CollaborationRequest {
  action: 'join-session' | 'leave-session' | 'update-presence' | 'get-active-users' | 'send-cursor' | 'send-selection' | 'get-session-info' | 'create-session' | 'end-session';
  sessionId?: string;
  projectId?: string;
  workItemId?: string;
  userId?: string;
  data?: {
    sessionType?: 'work_item' | 'board' | 'planning' | 'retrospective';
    metadata?: Record<string, unknown>;
    presence?: {
      status: 'active' | 'idle' | 'away';
      lastSeen: string;
      currentPage?: string;
      cursor?: { x: number; y: number };
      selection?: {
        elementId: string;
        elementType: string;
        range?: { start: number; end: number };
      };
    };
    cursor?: {
      x: number;
      y: number;
      elementId?: string;
    };
    selection?: {
      elementId: string;
      elementType: string;
      range?: { start: number; end: number };
    };
  };
}
```

### Response Format

```typescript
interface CollaborationResponse {
  data: unknown;
  success: boolean;
  error?: string;
}
```

## Actions

### Create Session

Create a new collaborative session.

```javascript
const response = await fetch('/functions/v1/collaboration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'create-session',
    projectId: 'project-123',
    workItemId: 'item-456', // optional
    userId: 'user-789',
    data: {
      sessionType: 'work_item',
      metadata: {
        title: 'Sprint Planning Session'
      }
    }
  })
});
```

### Join Session

Join an existing collaborative session.

```javascript
const response = await fetch('/functions/v1/collaboration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'join-session',
    sessionId: 'session-123',
    userId: 'user-789'
  })
});
```

### Update Presence

Update user presence information.

```javascript
const response = await fetch('/functions/v1/collaboration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'update-presence',
    userId: 'user-789',
    projectId: 'project-123',
    data: {
      presence: {
        status: 'active',
        lastSeen: new Date().toISOString(),
        currentPage: '/board',
        cursor: { x: 100, y: 200 }
      }
    }
  })
});
```

### Get Active Users

Retrieve active users in a project.

```javascript
const response = await fetch('/functions/v1/collaboration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'get-active-users',
    projectId: 'project-123'
  })
});
```

### Send Cursor Update

Broadcast cursor position to session participants.

```javascript
const response = await fetch('/functions/v1/collaboration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'send-cursor',
    sessionId: 'session-123',
    userId: 'user-789',
    data: {
      cursor: {
        x: 150,
        y: 250,
        elementId: 'work-item-456'
      }
    }
  })
});
```

### Send Selection Update

Broadcast text/element selection to session participants.

```javascript
const response = await fetch('/functions/v1/collaboration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'send-selection',
    sessionId: 'session-123',
    userId: 'user-789',
    data: {
      selection: {
        elementId: 'description-field',
        elementType: 'textarea',
        range: { start: 10, end: 25 }
      }
    }
  })
});
```

### Get Session Info

Retrieve detailed information about a collaborative session.

```javascript
const response = await fetch('/functions/v1/collaboration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'get-session-info',
    sessionId: 'session-123'
  })
});
```

### End Session

End a collaborative session (creator only).

```javascript
const response = await fetch('/functions/v1/collaboration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'end-session',
    sessionId: 'session-123',
    userId: 'user-789'
  })
});
```

## Session Types

- **work_item**: Collaboration on specific work items
- **board**: Board-level collaboration (Kanban, Scrum)
- **planning**: Sprint/iteration planning sessions
- **retrospective**: Team retrospective meetings

## Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Database Schema Requirements

### collaborative_sessions table

```sql
CREATE TABLE collaborative_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  work_item_id UUID REFERENCES work_items(id),
  session_type TEXT NOT NULL CHECK (session_type IN ('work_item', 'board', 'planning', 'retrospective')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  participants UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_presence table

```sql
CREATE TABLE user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'idle', 'away')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_page TEXT,
  cursor_position JSONB,
  selection_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);
```

## Real-time Features

The service uses Supabase Realtime for broadcasting events:

### Session Events
- `session_created`: New session created
- `user_joined`: User joined session
- `user_left`: User left session
- `cursor_update`: Cursor position updated
- `selection_update`: Selection changed
- `session_ended`: Session terminated

### Project Events
- `presence_updated`: User presence updated

### Subscribing to Events

```javascript
// Subscribe to session events
const sessionChannel = supabase
  .channel(`session:${sessionId}`)
  .on('broadcast', { event: 'cursor_update' }, (payload) => {
    console.log('Cursor update:', payload);
  })
  .on('broadcast', { event: 'user_joined' }, (payload) => {
    console.log('User joined:', payload);
  })
  .subscribe();

// Subscribe to project presence
const projectChannel = supabase
  .channel(`project:${projectId}`)
  .on('broadcast', { event: 'presence_updated' }, (payload) => {
    console.log('Presence updated:', payload);
  })
  .subscribe();
```

## Error Handling

The function returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (missing parameters)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `500`: Internal server error

Error responses include detailed error messages:

```json
{
  "error": "Missing required action parameter",
  "success": false
}
```

## Performance Considerations

- **Presence Updates**: Limit frequency to avoid overwhelming the system
- **Cursor Tracking**: Use throttling for smooth performance
- **Session Cleanup**: Inactive sessions are automatically marked as ended
- **User Timeout**: Users are considered inactive after 5 minutes
- **Broadcast Optimization**: Events are only sent to relevant participants

## Security

- **Authentication**: All requests require valid Supabase Auth tokens
- **Authorization**: Users can only access sessions they're part of
- **Session Ownership**: Only session creators can end sessions
- **Data Validation**: All input data is validated before processing
- **Rate Limiting**: Consider implementing rate limiting for high-frequency operations

## Future Enhancements

- **Voice/Video Integration**: Add WebRTC support for voice/video calls
- **Screen Sharing**: Implement screen sharing capabilities
- **Collaborative Editing**: Real-time text editing with operational transforms
- **Session Recording**: Record and replay collaboration sessions
- **Advanced Permissions**: Fine-grained permission controls
- **Analytics**: Track collaboration metrics and usage patterns
- **Mobile Support**: Optimize for mobile collaboration
- **Offline Sync**: Handle offline scenarios and conflict resolution