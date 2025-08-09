# Workflow Service Edge Function

This Supabase Edge Function provides comprehensive workflow management capabilities for the project management platform.

## Features

- **Workflow Management**: Get, create, and manage custom workflows
- **State Transitions**: Validate transitions and get available next states
- **Workflow States**: Create, update, and delete workflow states
- **Default Workflows**: Retrieve pre-configured workflows for different methodologies
- **Authentication**: Integrated with Supabase Auth
- **CORS Support**: Proper CORS handling for web applications

## Deployment

To deploy this Edge Function to Supabase:

```bash
supabase functions deploy workflow-service
```

## Usage

### Request Format

```typescript
interface WorkflowRequest {
  action: 'get' | 'create' | 'validate-transition' | 'get-transitions' | 'get-defaults' | 'create-state' | 'update-state' | 'delete-state';
  workflowId?: string;
  stateId?: string;
  data?: {
    name?: string;
    methodology?: 'scrum' | 'kanban' | 'waterfall' | 'custom';
    states?: WorkflowStateData[];
    transitions?: WorkflowTransitionData[];
    from?: string;
    to?: string;
    currentState?: string;
    state?: Omit<WorkflowStateData, 'id'>;
    updates?: Partial<WorkflowStateData>;
  };
}
```

### Response Format

```typescript
interface WorkflowResponse {
  data: any;
  success: boolean;
}
```

## Supported Actions

### 1. Get Workflow

Retrieve a specific workflow with its states and transitions.

```javascript
const response = await fetch('/functions/v1/workflow-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'get',
    workflowId: 'workflow-id'
  })
});
```

### 2. Create Custom Workflow

Create a new custom workflow with states and transitions.

```javascript
const response = await fetch('/functions/v1/workflow-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'create',
    data: {
      name: 'Custom Workflow',
      methodology: 'custom',
      states: [
        {
          name: 'To Do',
          category: 'todo',
          color: '#gray',
          wipLimit: 10
        },
        {
          name: 'In Progress',
          category: 'in_progress',
          color: '#blue',
          wipLimit: 5
        },
        {
          name: 'Done',
          category: 'done',
          color: '#green'
        }
      ],
      transitions: [
        { from: 'To Do', to: 'In Progress' },
        { from: 'In Progress', to: 'Done' }
      ]
    }
  })
});
```

### 3. Validate Transition

Check if a state transition is valid within a workflow.

```javascript
const response = await fetch('/functions/v1/workflow-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'validate-transition',
    workflowId: 'workflow-id',
    data: {
      from: 'To Do',
      to: 'In Progress'
    }
  })
});
```

### 4. Get Available Transitions

Get all possible next states from the current state.

```javascript
const response = await fetch('/functions/v1/workflow-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'get-transitions',
    workflowId: 'workflow-id',
    data: {
      currentState: 'To Do'
    }
  })
});
```

### 5. Get Default Workflows

Retrieve all pre-configured default workflows.

```javascript
const response = await fetch('/functions/v1/workflow-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'get-defaults'
  })
});
```

### 6. Create Workflow State

Add a new state to an existing workflow.

```javascript
const response = await fetch('/functions/v1/workflow-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'create-state',
    workflowId: 'workflow-id',
    data: {
      state: {
        name: 'Review',
        category: 'in_progress',
        color: '#yellow',
        wipLimit: 3
      }
    }
  })
});
```

### 7. Update Workflow State

Update an existing workflow state.

```javascript
const response = await fetch('/functions/v1/workflow-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'update-state',
    stateId: 'state-id',
    data: {
      updates: {
        name: 'Code Review',
        wipLimit: 5
      }
    }
  })
});
```

### 8. Delete Workflow State

Remove a workflow state.

```javascript
const response = await fetch('/functions/v1/workflow-service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'delete-state',
    stateId: 'state-id'
  })
});
```

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

This function expects the following database tables:

- `workflows`: Main workflow definitions
- `workflow_states`: Individual states within workflows
- `workflow_transitions`: Valid transitions between states

## Performance Considerations

- Database queries are optimized with proper indexing
- Batch operations are used where possible
- Error handling prevents unnecessary database calls
- CORS headers are cached for preflight requests

## Security

- All requests require valid Supabase authentication
- Input validation prevents SQL injection
- Row Level Security (RLS) policies are enforced
- CORS is properly configured for web applications

## Future Enhancements

- Workflow versioning support
- Bulk state operations
- Transition condition validation
- Workflow templates
- Analytics and usage tracking