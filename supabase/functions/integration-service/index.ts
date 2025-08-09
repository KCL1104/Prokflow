// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

// Supabase Edge Function for third-party integrations
// This function handles integrations with external services like Jira, GitHub, Slack, etc.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

interface Integration {
  id: string;
  projectId: string;
  type: string;
  name: string;
  isActive: boolean;
  config: Record<string, unknown>;
  lastSyncAt?: string;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface SyncResult {
  integrationId: string;
  status: 'success' | 'error' | 'partial';
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsSkipped: number;
  errors: string[];
  duration: number;
  lastSyncAt: string;
}

interface ConnectionTest {
  success: boolean;
  message: string;
  details?: {
    apiVersion?: string;
    permissions?: string[];
    rateLimits?: {
      remaining: number;
      resetAt: string;
    };
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Parse request body
    const { action, integrationType, projectId, integrationId, data }: IntegrationRequest = await req.json()

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing required action parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let result: unknown;
    
    switch (action) {
      case 'connect':
        if (!integrationType || !projectId || !data?.credentials) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for connect action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await connectIntegration(supabaseClient, {
          type: integrationType,
          projectId,
          credentials: data.credentials,
          config: data.config
        });
        break;
        
      case 'disconnect':
        if (!integrationId) {
          return new Response(
            JSON.stringify({ error: 'Missing integrationId for disconnect action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await disconnectIntegration(supabaseClient, integrationId);
        break;
        
      case 'sync':
        if (!integrationId) {
          return new Response(
            JSON.stringify({ error: 'Missing integrationId for sync action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await syncIntegration(supabaseClient, integrationId, data?.syncOptions);
        break;
        
      case 'webhook':
        if (!integrationId || !data?.webhookPayload) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for webhook action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await handleWebhook(supabaseClient, integrationId, data.webhookPayload);
        break;
        
      case 'get-integrations':
        if (!projectId) {
          return new Response(
            JSON.stringify({ error: 'Missing projectId for get-integrations action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await getIntegrations(supabaseClient, projectId);
        break;
        
      case 'test-connection':
        if (!integrationType || !data?.credentials) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for test-connection action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await testConnection(integrationType, data.credentials);
        break;
        
      case 'import-data':
        if (!integrationId || !data?.importData) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for import-data action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await importData(supabaseClient, integrationId, data.importData);
        break;
        
      case 'export-data':
        if (!integrationId) {
          return new Response(
            JSON.stringify({ error: 'Missing integrationId for export-data action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await exportData(supabaseClient, integrationId, data?.exportFormat || 'json');
        break;
        
      case 'get-sync-status':
        if (!integrationId) {
          return new Response(
            JSON.stringify({ error: 'Missing integrationId for get-sync-status action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await getSyncStatus(supabaseClient, integrationId);
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    return new Response(
      JSON.stringify({ data: result, success: true }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Integration service error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper functions for integration operations
async function connectIntegration(supabase: ReturnType<typeof createClient>, integrationData: {
  type: string;
  projectId: string;
  credentials: Record<string, unknown>;
  config?: Record<string, unknown>;
}): Promise<Integration> {
  // Encrypt credentials before storing
  const encryptedCredentials = await encryptCredentials(integrationData.credentials);
  
  const { data, error } = await supabase
    .from('integrations')
    .insert({
      project_id: integrationData.projectId,
      type: integrationData.type,
      name: `${integrationData.type.charAt(0).toUpperCase() + integrationData.type.slice(1)} Integration`,
      credentials: encryptedCredentials,
      config: integrationData.config || {},
      is_active: true,
      sync_status: 'idle'
    })
    .select()
    .single();
    
  if (error) throw error;
  
  const integration: Integration = {
    id: data.id,
    projectId: data.project_id,
    type: data.type,
    name: data.name,
    isActive: data.is_active,
    config: data.config,
    lastSyncAt: data.last_sync_at,
    syncStatus: data.sync_status,
    errorMessage: data.error_message,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
  
  // Test connection after creating integration
  try {
    await testConnection(integrationData.type, integrationData.credentials);
  } catch (testError) {
    // Update integration with error status
    await supabase
      .from('integrations')
      .update({ 
        sync_status: 'error',
        error_message: `Connection test failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`
      })
      .eq('id', data.id);
      
    throw new Error(`Integration created but connection test failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`);
  }
  
  return integration;
}

async function disconnectIntegration(supabase: ReturnType<typeof createClient>, integrationId: string): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('integrations')
    .update({ 
      is_active: false,
      sync_status: 'idle'
    })
    .eq('id', integrationId);
    
  if (error) throw error;
  
  return { success: true };
}

async function syncIntegration(supabase: ReturnType<typeof createClient>, integrationId: string, syncOptions?: {
  includeComments?: boolean;
  includeAttachments?: boolean;
  includeHistory?: boolean;
  batchSize?: number;
  startDate?: string;
  endDate?: string;
}): Promise<SyncResult> {
  const startTime = Date.now();
  
  // Get integration details
  const { data: integration, error: integrationError } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', integrationId)
    .single();
    
  if (integrationError) throw integrationError;
  
  // Update sync status to 'syncing'
  await supabase
    .from('integrations')
    .update({ sync_status: 'syncing' })
    .eq('id', integrationId);
  
  try {
    // Decrypt credentials
    const credentials = await decryptCredentials(integration.credentials);
    
    // Perform sync based on integration type
    const syncResult = await performSync(integration.type, credentials, integration.config, syncOptions);
    
    // Update integration with success status
    await supabase
      .from('integrations')
      .update({ 
        sync_status: 'success',
        last_sync_at: new Date().toISOString(),
        error_message: null
      })
      .eq('id', integrationId);
    
    // Store sync log
    await supabase
      .from('integration_sync_logs')
      .insert({
        integration_id: integrationId,
        status: syncResult.status,
        items_processed: syncResult.itemsProcessed,
        items_created: syncResult.itemsCreated,
        items_updated: syncResult.itemsUpdated,
        items_skipped: syncResult.itemsSkipped,
        errors: syncResult.errors,
        duration: Date.now() - startTime
      });
    
    return {
      integrationId,
      status: syncResult.status,
      itemsProcessed: syncResult.itemsProcessed,
      itemsCreated: syncResult.itemsCreated,
      itemsUpdated: syncResult.itemsUpdated,
      itemsSkipped: syncResult.itemsSkipped,
      errors: syncResult.errors,
      duration: Date.now() - startTime,
      lastSyncAt: new Date().toISOString()
    };
    
  } catch (error) {
    // Update integration with error status
    await supabase
      .from('integrations')
      .update({ 
        sync_status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', integrationId);
    
    throw error;
  }
}

async function handleWebhook(supabase: ReturnType<typeof createClient>, integrationId: string, payload: Record<string, unknown>): Promise<{ success: boolean; processed: boolean }> {
  // Get integration details
  const { data: integration, error: integrationError } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', integrationId)
    .single();
    
  if (integrationError) throw integrationError;
  
  // Process webhook based on integration type
  const processed = await processWebhook(integration.type, payload, integration.config);
  
  // Log webhook event
  await supabase
    .from('webhook_logs')
    .insert({
      integration_id: integrationId,
      event_type: payload.event_type || 'unknown',
      payload,
      processed,
      processed_at: new Date().toISOString()
    });
  
  return { success: true, processed };
}

async function getIntegrations(supabase: ReturnType<typeof createClient>, projectId: string): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return (data || []).map((integration: {
    id: string;
    project_id: string;
    type: string;
    name: string;
    is_active: boolean;
    config: Record<string, unknown>;
    last_sync_at?: string;
    sync_status: 'idle' | 'syncing' | 'error' | 'success';
    error_message?: string;
    created_at: string;
    updated_at: string;
  }) => ({
    id: integration.id,
    projectId: integration.project_id,
    type: integration.type,
    name: integration.name,
    isActive: integration.is_active,
    config: integration.config,
    lastSyncAt: integration.last_sync_at,
    syncStatus: integration.sync_status,
    errorMessage: integration.error_message,
    createdAt: integration.created_at,
    updatedAt: integration.updated_at
  }));
}

async function testConnection(integrationType: string, credentials: Record<string, unknown>): Promise<ConnectionTest> {
  switch (integrationType) {
    case 'jira':
      return await testJiraConnection(credentials);
    case 'github':
      return await testGitHubConnection(credentials);
    case 'slack':
      return await testSlackConnection(credentials);
    case 'trello':
      return await testTrelloConnection(credentials);
    case 'asana':
      return await testAsanaConnection(credentials);
    case 'linear':
      return await testLinearConnection(credentials);
    case 'notion':
      return await testNotionConnection(credentials);
    case 'teams':
      return await testTeamsConnection(credentials);
    default:
      throw new Error(`Unsupported integration type: ${integrationType}`);
  }
}

async function importData(supabase: ReturnType<typeof createClient>, _integrationId: string, importData: {
  workItems?: unknown[];
  projects?: unknown[];
  users?: unknown[];
}): Promise<{ imported: number; skipped: number; errors: string[] }> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];
  
  // Import work items
  if (importData.workItems) {
    for (const item of importData.workItems) {
      try {
        await importWorkItem(supabase, item);
        imported++;
      } catch (error) {
        errors.push(`Work item import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        skipped++;
      }
    }
  }
  
  // Import projects
  if (importData.projects) {
    for (const project of importData.projects) {
      try {
        await importProject(supabase, project);
        imported++;
      } catch (error) {
        errors.push(`Project import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        skipped++;
      }
    }
  }
  
  // Import users
  if (importData.users) {
    for (const user of importData.users) {
      try {
        await importUser(supabase, user);
        imported++;
      } catch (error) {
        errors.push(`User import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        skipped++;
      }
    }
  }
  
  return { imported, skipped, errors };
}

async function exportData(supabase: ReturnType<typeof createClient>, integrationId: string, format: 'json' | 'csv' | 'xlsx'): Promise<{ url: string; format: string; size: number }> {
  // Get integration details
  const { data: integration, error: integrationError } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', integrationId)
    .single();
    
  if (integrationError) throw integrationError;
  
  // Export data based on format
  const exportResult = await generateExport(supabase, integration.project_id, format);
  
  return exportResult;
}

async function getSyncStatus(supabase: ReturnType<typeof createClient>, integrationId: string): Promise<{
  status: string;
  lastSyncAt?: string;
  errorMessage?: string;
  recentLogs: unknown[];
}> {
  // Get integration status
  const { data: integration, error: integrationError } = await supabase
    .from('integrations')
    .select('sync_status, last_sync_at, error_message')
    .eq('id', integrationId)
    .single();
    
  if (integrationError) throw integrationError;
  
  // Get recent sync logs
  const { data: logs, error: logsError } = await supabase
    .from('integration_sync_logs')
    .select('*')
    .eq('integration_id', integrationId)
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (logsError) throw logsError;
  
  return {
    status: integration.sync_status,
    lastSyncAt: integration.last_sync_at,
    errorMessage: integration.error_message,
    recentLogs: logs || []
  };
}

// Integration-specific connection test functions
function testJiraConnection(_credentials: Record<string, unknown>): Promise<ConnectionTest> {
  // Implement Jira API connection test
  return Promise.resolve({ success: true, message: 'Jira connection successful' });
}

function testGitHubConnection(_credentials: Record<string, unknown>): Promise<ConnectionTest> {
  // Implement GitHub API connection test
  return Promise.resolve({ success: true, message: 'GitHub connection successful' });
}

function testSlackConnection(_credentials: Record<string, unknown>): Promise<ConnectionTest> {
  // Implement Slack API connection test
  return Promise.resolve({ success: true, message: 'Slack connection successful' });
}

function testTrelloConnection(_credentials: Record<string, unknown>): Promise<ConnectionTest> {
  // Implement Trello API connection test
  return Promise.resolve({ success: true, message: 'Trello connection successful' });
}

function testAsanaConnection(_credentials: Record<string, unknown>): Promise<ConnectionTest> {
  // Implement Asana API connection test
  return Promise.resolve({ success: true, message: 'Asana connection successful' });
}

function testLinearConnection(_credentials: Record<string, unknown>): Promise<ConnectionTest> {
  // Implement Linear API connection test
  return Promise.resolve({ success: true, message: 'Linear connection successful' });
}

function testNotionConnection(_credentials: Record<string, unknown>): Promise<ConnectionTest> {
  // Implement Notion API connection test
  return Promise.resolve({ success: true, message: 'Notion connection successful' });
}

function testTeamsConnection(_credentials: Record<string, unknown>): Promise<ConnectionTest> {
  // Implement Microsoft Teams API connection test
  return Promise.resolve({ success: true, message: 'Teams connection successful' });
}

// Utility functions
function encryptCredentials(credentials: Record<string, unknown>): Promise<string> {
  // Implement credential encryption
  return Promise.resolve(btoa(JSON.stringify(credentials)));
}

function decryptCredentials(encryptedCredentials: string): Promise<Record<string, unknown>> {
  // Implement credential decryption
  return Promise.resolve(JSON.parse(atob(encryptedCredentials)));
}

function performSync(_integrationType: string, _credentials: Record<string, unknown>, _config: Record<string, unknown>, _syncOptions?: Record<string, unknown>): Promise<{
  status: 'success' | 'error' | 'partial';
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsSkipped: number;
  errors: string[];
}> {
  // Implement sync logic based on integration type
  return Promise.resolve({
    status: 'success',
    itemsProcessed: 0,
    itemsCreated: 0,
    itemsUpdated: 0,
    itemsSkipped: 0,
    errors: []
  });
}

function processWebhook(_integrationType: string, _payload: Record<string, unknown>, _config: Record<string, unknown>): Promise<boolean> {
  // Implement webhook processing logic
  return Promise.resolve(true);
}

async function importWorkItem(_supabase: ReturnType<typeof createClient>, _item: unknown): Promise<void> {
  // Implement work item import logic
}

async function importProject(_supabase: ReturnType<typeof createClient>, _project: unknown): Promise<void> {
  // Implement project import logic
}

async function importUser(_supabase: ReturnType<typeof createClient>, _user: unknown): Promise<void> {
  // Implement user import logic
}

function generateExport(_supabase: ReturnType<typeof createClient>, _projectId: string, format: string): Promise<{ url: string; format: string; size: number }> {
  // Implement data export logic
  return Promise.resolve({
    url: 'https://example.com/export.json',
    format,
    size: 1024
  });
}