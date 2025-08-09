# Integration Service Edge Function

A Supabase Edge Function that provides third-party integration capabilities for the Kiro Pro project management platform.

## Features

- **Multiple Integrations**: Support for Jira, GitHub, Slack, Trello, Asana, Linear, Notion, and Microsoft Teams
- **Bidirectional Sync**: Import and export data between platforms
- **Real-time Webhooks**: Handle real-time updates from external services
- **Connection Testing**: Validate integration credentials before setup
- **Data Import/Export**: Bulk data operations with multiple formats
- **Sync Management**: Monitor and control synchronization processes
- **Secure Credentials**: Encrypted storage of API keys and tokens
- **Authentication**: Secure access with Supabase Auth
- **CORS Support**: Cross-origin resource sharing enabled

## Deployment

```bash
# Deploy the function
supabase functions deploy integration-service

# Set environment variables
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_ANON_KEY=your_anon_key
```

## Usage

### Request Format

```typescript
interface IntegrationRequest {
  action: 'connect' | 'disconnect' | 'sync' | 'webhook' | 'get-integrations' | 'test-connection' | 'import-data' | 'export-data' | 'get-sync-status';
  integrationType?: 'jira' | 'github' | 'slack' | 'trello' | 'asana' | 'linear' | 'notion' | 'teams';
  projectId?: string;
  integrationId?: string;
  data?: {
    credentials?: {
      apiKey?: string;
      token?: string;
      clientId?: string;
      clientSecret?: string;
      webhookUrl?: string;
      baseUrl?: string;
      username?: string;
      password?: string;
    };
    config?: {
      syncDirection?: 'import' | 'export' | 'bidirectional';
      syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'manual';
      fieldMappings?: Record<string, string>;
      filters?: {
        projects?: string[];
        labels?: string[];
        assignees?: string[];
        statuses?: string[];
      };
      webhookEvents?: string[];
    };
    syncOptions?: {
      includeComments?: boolean;
      includeAttachments?: boolean;
      includeHistory?: boolean;
      batchSize?: number;
      startDate?: string;
      endDate?: string;
    };
    webhookPayload?: Record<string, unknown>;
    exportFormat?: 'json' | 'csv' | 'xlsx';
    importData?: {
      workItems?: unknown[];
      projects?: unknown[];
      users?: unknown[];
    };
  };
}
```

### Response Format

```typescript
interface IntegrationResponse {
  data: unknown;
  success: boolean;
  error?: string;
}
```

## Actions

### Connect Integration

Connect a new third-party integration.

```javascript
const response = await fetch('/functions/v1/integration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'connect',
    integrationType: 'jira',
    projectId: 'project-123',
    data: {
      credentials: {
        baseUrl: 'https://company.atlassian.net',
        username: 'user@company.com',
        apiKey: 'your-api-key'
      },
      config: {
        syncDirection: 'bidirectional',
        syncFrequency: 'hourly',
        fieldMappings: {
          'summary': 'title',
          'description': 'description',
          'assignee': 'assignee_id'
        },
        filters: {
          projects: ['PROJ'],
          statuses: ['To Do', 'In Progress', 'Done']
        }
      }
    }
  })
});
```

### Test Connection

Test integration credentials before connecting.

```javascript
const response = await fetch('/functions/v1/integration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'test-connection',
    integrationType: 'github',
    data: {
      credentials: {
        token: 'ghp_your_github_token'
      }
    }
  })
});
```

### Sync Integration

Manually trigger synchronization.

```javascript
const response = await fetch('/functions/v1/integration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'sync',
    integrationId: 'integration-123',
    data: {
      syncOptions: {
        includeComments: true,
        includeAttachments: false,
        batchSize: 50,
        startDate: '2024-01-01T00:00:00Z'
      }
    }
  })
});
```

### Handle Webhook

Process incoming webhook from external service.

```javascript
const response = await fetch('/functions/v1/integration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'webhook',
    integrationId: 'integration-123',
    data: {
      webhookPayload: {
        event_type: 'issue_updated',
        issue: {
          id: 'PROJ-123',
          summary: 'Updated issue title',
          status: 'In Progress'
        }
      }
    }
  })
});
```

### Get Integrations

Retrieve all integrations for a project.

```javascript
const response = await fetch('/functions/v1/integration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'get-integrations',
    projectId: 'project-123'
  })
});
```

### Import Data

Bulk import data from external source.

```javascript
const response = await fetch('/functions/v1/integration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'import-data',
    integrationId: 'integration-123',
    data: {
      importData: {
        workItems: [
          {
            title: 'Imported Task 1',
            description: 'Task description',
            status: 'To Do',
            assignee: 'user@company.com'
          }
        ]
      }
    }
  })
});
```

### Export Data

Export project data to external format.

```javascript
const response = await fetch('/functions/v1/integration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'export-data',
    integrationId: 'integration-123',
    data: {
      exportFormat: 'csv'
    }
  })
});
```

### Get Sync Status

Check synchronization status and logs.

```javascript
const response = await fetch('/functions/v1/integration-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'get-sync-status',
    integrationId: 'integration-123'
  })
});
```

## Supported Integrations

### Jira
- **Authentication**: Username + API Token or OAuth
- **Features**: Issues, Projects, Users, Comments, Attachments
- **Webhooks**: Issue events, Project events
- **Field Mapping**: Custom field mapping support

### GitHub
- **Authentication**: Personal Access Token or GitHub App
- **Features**: Issues, Pull Requests, Projects, Repositories
- **Webhooks**: Issue events, PR events, Push events
- **Sync**: Bidirectional issue synchronization

### Slack
- **Authentication**: Bot Token or OAuth
- **Features**: Channels, Messages, Users, Notifications
- **Webhooks**: Message events, Channel events
- **Integration**: Project notifications and updates

### Trello
- **Authentication**: API Key + Token
- **Features**: Boards, Lists, Cards, Members
- **Webhooks**: Card events, Board events
- **Sync**: Card to work item mapping

### Asana
- **Authentication**: Personal Access Token or OAuth
- **Features**: Tasks, Projects, Teams, Users
- **Webhooks**: Task events, Project events
- **Sync**: Task synchronization with work items

### Linear
- **Authentication**: API Key
- **Features**: Issues, Projects, Teams, Users
- **Webhooks**: Issue events, Project events
- **Sync**: Issue to work item mapping

### Notion
- **Authentication**: Integration Token
- **Features**: Pages, Databases, Users
- **Webhooks**: Page events, Database events
- **Sync**: Database records to work items

### Microsoft Teams
- **Authentication**: App Registration + OAuth
- **Features**: Teams, Channels, Messages, Users
- **Webhooks**: Message events, Team events
- **Integration**: Team notifications and collaboration

## Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `ENCRYPTION_KEY`: Key for encrypting stored credentials (optional)

## Database Schema Requirements

### integrations table

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  type TEXT NOT NULL CHECK (type IN ('jira', 'github', 'slack', 'trello', 'asana', 'linear', 'notion', 'teams')),
  name TEXT NOT NULL,
  credentials TEXT NOT NULL, -- encrypted
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error', 'success')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### integration_sync_logs table

```sql
CREATE TABLE integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  items_processed INTEGER DEFAULT 0,
  items_created INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  items_skipped INTEGER DEFAULT 0,
  errors TEXT[],
  duration INTEGER, -- milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### webhook_logs table

```sql
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Field Mapping

Configure how fields are mapped between systems:

```json
{
  "fieldMappings": {
    "external_field": "kiro_field",
    "summary": "title",
    "description": "description",
    "assignee": "assignee_id",
    "status": "status",
    "priority": "priority",
    "labels": "tags",
    "created": "created_at",
    "updated": "updated_at"
  }
}
```

## Sync Configuration

### Sync Directions
- **import**: Only import data from external system
- **export**: Only export data to external system
- **bidirectional**: Two-way synchronization

### Sync Frequencies
- **realtime**: Immediate sync via webhooks
- **hourly**: Sync every hour
- **daily**: Sync once per day
- **manual**: Only sync when manually triggered

### Filters

```json
{
  "filters": {
    "projects": ["PROJ", "DEV"],
    "labels": ["bug", "feature"],
    "assignees": ["user1@company.com"],
    "statuses": ["To Do", "In Progress"],
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    }
  }
}
```

## Error Handling

The function returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (missing parameters)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `429`: Rate limit exceeded
- `500`: Internal server error

Error responses include detailed error messages:

```json
{
  "error": "Connection test failed",
  "details": "Invalid API credentials",
  "success": false
}
```

## Security

- **Credential Encryption**: All API keys and tokens are encrypted before storage
- **Authentication**: All requests require valid Supabase Auth tokens
- **Authorization**: Users can only access integrations for their projects
- **Rate Limiting**: Built-in protection against API abuse
- **Webhook Validation**: Verify webhook signatures when supported
- **Secure Storage**: Credentials are never logged or exposed

## Performance Considerations

- **Batch Processing**: Large datasets are processed in configurable batches
- **Rate Limiting**: Respect external API rate limits
- **Caching**: Cache frequently accessed data to reduce API calls
- **Async Processing**: Long-running syncs are processed asynchronously
- **Error Recovery**: Automatic retry logic for transient failures
- **Monitoring**: Track sync performance and success rates

## Monitoring and Logging

- **Sync Logs**: Detailed logs of all synchronization attempts
- **Webhook Logs**: Track all incoming webhook events
- **Error Tracking**: Comprehensive error logging and reporting
- **Performance Metrics**: Monitor sync duration and success rates
- **Health Checks**: Regular connection testing for active integrations

## Future Enhancements

- **Additional Integrations**: Support for more third-party services
- **Advanced Mapping**: Complex field transformation rules
- **Conflict Resolution**: Handle data conflicts in bidirectional sync
- **Bulk Operations**: Optimize for large-scale data operations
- **Real-time Sync**: Improve real-time synchronization capabilities
- **Analytics**: Integration usage and performance analytics
- **Custom Integrations**: Framework for building custom integrations
- **Data Validation**: Enhanced data validation and sanitization