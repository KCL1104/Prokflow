// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

// Supabase Edge Function for notification management
// This function handles notification creation, delivery, and management

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Type definitions for better type safety
type NotificationType = 
  | 'work_item_assigned' 
  | 'work_item_updated' 
  | 'sprint_started' 
  | 'sprint_ended' 
  | 'comment_added' 
  | 'mention' 
  | 'deadline_reminder' 
  | 'project_invitation';

type NotificationAction = 
  | 'create' 
  | 'get-user-notifications' 
  | 'mark-read' 
  | 'mark-all-read' 
  | 'delete' 
  | 'get-unread-count' 
  | 'send-bulk';

interface NotificationRequest {
  action: NotificationAction;
  notificationId?: string;
  userId?: string;
  data?: {
    type?: NotificationType;
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

interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  projectId?: string;
  workItemId?: string;
  sprintId?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  projectId?: string;
  workItemId?: string;
  sprintId?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

interface DatabaseNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  user_id: string;
  project_id?: string;
  work_item_id?: string;
  sprint_id?: string;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

interface EmailPreferences {
  [key: string]: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client for user-context operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Initialize admin client for admin operations (bypasses RLS)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse request body
    const { action, notificationId, userId, data }: NotificationRequest = await req.json()

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
      case 'create':
        if (!data?.type || !data?.title || !data?.message || !userId) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for create action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await createNotification(supabaseClient, adminClient, {
          type: data.type,
          title: data.title,
          message: data.message,
          userId: userId,
          projectId: data.projectId,
          workItemId: data.workItemId,
          sprintId: data.sprintId,
          metadata: data.metadata
        });
        break;
        
      case 'get-user-notifications':
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Missing userId for get-user-notifications action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await getUserNotifications(supabaseClient, userId, data?.page, data?.limit);
        break;
        
      case 'mark-read':
        if (!notificationId) {
          return new Response(
            JSON.stringify({ error: 'Missing notificationId for mark-read action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await markNotificationRead(supabaseClient, notificationId);
        break;
        
      case 'mark-all-read':
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Missing userId for mark-all-read action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await markAllNotificationsRead(supabaseClient, userId);
        break;
        
      case 'delete':
        if (!notificationId) {
          return new Response(
            JSON.stringify({ error: 'Missing notificationId for delete action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await deleteNotification(supabaseClient, notificationId);
        break;
        
      case 'get-unread-count':
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Missing userId for get-unread-count action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await getUnreadCount(supabaseClient, userId);
        break;
        
      case 'send-bulk':
        if (!data?.notifications || !Array.isArray(data.notifications)) {
          return new Response(
            JSON.stringify({ error: 'Missing notifications array for send-bulk action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await sendBulkNotifications(supabaseClient, adminClient, data.notifications);
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
    console.error('Notification service error:', error);
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

// Helper functions for notification operations
async function createNotification(supabase: ReturnType<typeof createClient>, adminClient: ReturnType<typeof createClient>, notification: NotificationData): Promise<NotificationResponse> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      user_id: notification.userId,
      project_id: notification.projectId,
      work_item_id: notification.workItemId,
      sprint_id: notification.sprintId,
      metadata: notification.metadata,
      is_read: false
    })
    .select()
    .single();
    
  if (error) throw error;
  
  const notificationResponse = {
    id: data.id,
    type: data.type,
    title: data.title,
    message: data.message,
    userId: data.user_id,
    projectId: data.project_id,
    workItemId: data.work_item_id,
    sprintId: data.sprint_id,
    metadata: data.metadata,
    isRead: data.is_read,
    createdAt: data.created_at
  };
  
  // Send real-time notification
  await sendRealtimeNotification(supabase, notification.userId, notificationResponse);
  
  // Send email notification (if user preferences allow)
  await sendEmailNotification(supabase, adminClient, notification.userId, notificationResponse);
  
  return {
    id: data.id,
    type: data.type,
    title: data.title,
    message: data.message,
    userId: data.user_id,
    projectId: data.project_id,
    workItemId: data.work_item_id,
    sprintId: data.sprint_id,
    metadata: data.metadata,
    isRead: data.is_read,
    createdAt: data.created_at
  };
}

async function getUserNotifications(supabase: ReturnType<typeof createClient>, userId: string, page = 1, limit = 20): Promise<{
  notifications: NotificationResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const offset = (page - 1) * limit;
  
  // Get total count
  const { count, error: countError } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
    
  if (countError) throw countError;
  
  // Get notifications
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (error) throw error;
  
  const notifications = (data || []).map((notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    user_id: string;
    project_id?: string;
    work_item_id?: string;
    sprint_id?: string;
    metadata?: Record<string, unknown>;
    is_read: boolean;
    created_at: string;
  }) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    userId: notification.user_id,
    projectId: notification.project_id,
    workItemId: notification.work_item_id,
    sprintId: notification.sprint_id,
    metadata: notification.metadata,
    isRead: notification.is_read,
    createdAt: notification.created_at
  }));
  
  return {
    notifications,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
}

async function markNotificationRead(supabase: ReturnType<typeof createClient>, notificationId: string): Promise<NotificationResponse> {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    type: data.type,
    title: data.title,
    message: data.message,
    userId: data.user_id,
    projectId: data.project_id,
    workItemId: data.work_item_id,
    sprintId: data.sprint_id,
    metadata: data.metadata,
    isRead: data.is_read,
    createdAt: data.created_at
  };
}

async function markAllNotificationsRead(supabase: ReturnType<typeof createClient>, userId: string): Promise<{ count: number }> {
  const { count, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select('*', { count: 'exact', head: true });
    
  if (error) throw error;
  
  return { count: count || 0 };
}

async function deleteNotification(supabase: ReturnType<typeof createClient>, notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
    
  if (error) throw error;
}

async function getUnreadCount(supabase: ReturnType<typeof createClient>, userId: string): Promise<{ count: number }> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
    
  if (error) throw error;
  
  return { count: count || 0 };
}

async function sendBulkNotifications(supabase: ReturnType<typeof createClient>, adminClient: ReturnType<typeof createClient>, notifications: NotificationData[]): Promise<NotificationResponse[]> {
  const notificationsToInsert = notifications.map(notification => ({
    type: notification.type,
    title: notification.title,
    message: notification.message,
    user_id: notification.userId,
    project_id: notification.projectId,
    work_item_id: notification.workItemId,
    sprint_id: notification.sprintId,
    metadata: notification.metadata,
    is_read: false
  }));
  
  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationsToInsert)
    .select();
    
  if (error) throw error;
  
  const createdNotifications = (data || []).map((notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    user_id: string;
    project_id?: string;
    work_item_id?: string;
    sprint_id?: string;
    metadata?: Record<string, unknown>;
    is_read: boolean;
    created_at: string;
  }) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    userId: notification.user_id,
    projectId: notification.project_id,
    workItemId: notification.work_item_id,
    sprintId: notification.sprint_id,
    metadata: notification.metadata,
    isRead: notification.is_read,
    createdAt: notification.created_at
  }));
  
  // Send real-time and email notifications to all users
  for (const notification of createdNotifications) {
    await sendRealtimeNotification(supabase, notification.userId, notification);
    await sendEmailNotification(supabase, adminClient, notification.userId, notification);
  }
  
  return createdNotifications;
}

async function sendRealtimeNotification(supabase: ReturnType<typeof createClient>, userId: string, notification: NotificationResponse): Promise<void> {
  try {
    // Use Supabase realtime to send notification
    await supabase
      .channel(`user:${userId}`)
      .send({
        type: 'broadcast',
        event: 'notification',
        payload: notification
      });
  } catch (error) {
    console.error('Failed to send realtime notification:', error);
    // Don't throw error as this is not critical for the main operation
  }
}

// Helper function to validate notification data
function _validateNotificationData(data: Partial<NotificationData>): data is NotificationData {
  return !!(
    data.type &&
    data.title &&
    data.message &&
    data.userId &&
    typeof data.type === 'string' &&
    typeof data.title === 'string' &&
    typeof data.message === 'string' &&
    typeof data.userId === 'string'
  );
}

// Helper function to transform database notification to response format
function _transformDatabaseNotification(dbNotification: DatabaseNotification): NotificationResponse {
  return {
    id: dbNotification.id,
    type: dbNotification.type,
    title: dbNotification.title,
    message: dbNotification.message,
    userId: dbNotification.user_id,
    projectId: dbNotification.project_id,
    workItemId: dbNotification.work_item_id,
    sprintId: dbNotification.sprint_id,
    metadata: dbNotification.metadata,
    isRead: dbNotification.is_read,
    createdAt: dbNotification.created_at
  };
}

// Helper function to check if user should receive email notifications
function shouldSendEmailForType(notificationType: string, preferences: EmailPreferences): boolean {
  // Default email preferences - users can customize these
  const defaultPreferences: Record<string, boolean> = {
    work_item_assigned: true,
    work_item_updated: false, // Too noisy by default
    sprint_started: true,
    sprint_ended: true,
    comment_added: false, // Too noisy by default
    mention: true,
    deadline_reminder: true,
    project_invitation: true
  };
  
  return preferences[notificationType] ?? defaultPreferences[notificationType] ?? false;
}

// Helper function to generate email content
function _generateEmailContent(notification: NotificationResponse): Record<string, string> {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://your-app.com';
  
  // Generate appropriate links based on notification type
  let actionUrl = baseUrl;
  if (notification.projectId) {
    actionUrl = `${baseUrl}/projects/${notification.projectId}`;
    
    if (notification.workItemId) {
      actionUrl = `${baseUrl}/projects/${notification.projectId}/work-items/${notification.workItemId}`;
    } else if (notification.sprintId) {
      actionUrl = `${baseUrl}/projects/${notification.projectId}/sprints/${notification.sprintId}`;
    }
  }
  
  return {
    subject: notification.title,
    body: notification.message,
    actionUrl,
    actionText: getActionTextForType(notification.type)
  };
}

// Helper function to get action text based on notification type
function getActionTextForType(notificationType: string): string {
  const actionTexts: Record<string, string> = {
    work_item_assigned: 'View Work Item',
    work_item_updated: 'View Work Item',
    sprint_started: 'View Sprint',
    sprint_ended: 'View Sprint',
    comment_added: 'View Comment',
    mention: 'View Mention',
    deadline_reminder: 'View Task',
    project_invitation: 'View Project'
  };
  
  return actionTexts[notificationType] || 'View Details';
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

function _checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Helper function to send email notifications using Supabase Auth
async function sendEmailNotification(supabase: ReturnType<typeof createClient>, adminClient: ReturnType<typeof createClient>, userId: string, notification: NotificationResponse): Promise<void> {
  try {
    // Get user email from Supabase Auth using admin client
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user?.email) {
      console.warn(`Unable to get email for user ${userId}:`, userError?.message);
      return;
    }

    // Get user email preferences
    const { data: preferencesData } = await supabase
      .from('user_email_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();
    
    const emailPreferences = preferencesData?.preferences || {};
    
    // Check if user wants to receive this type of email
    if (!shouldSendEmailForType(notification.type, emailPreferences)) {
      return;
    }

    // Generate email content
    const emailContent = generateEmailContentForEmail(notification);
    
    // Send email using Supabase Edge Function for emails
    const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: userData.user.email,
        subject: emailContent.subject,
        html: emailContent.html_content,
        text: emailContent.text_content
      })
    });

    if (!emailResponse.ok) {
      console.error('Failed to send email:', await emailResponse.text());
    }
  } catch (error) {
    console.error('Failed to send email notification:', error);
    // Don't throw error as this is not critical for the main operation
  }
}

// Helper function to generate email content with proper HTML formatting
function generateEmailContentForEmail(notification: NotificationResponse): { subject: string; html_content: string; text_content: string } {
  const baseUrl = Deno.env.get('SITE_URL') || 'https://your-app.com';
  
  // Generate appropriate links based on notification type
  let actionUrl = baseUrl;
  if (notification.projectId) {
    actionUrl = `${baseUrl}/projects/${notification.projectId}`;
    
    if (notification.workItemId) {
      actionUrl = `${baseUrl}/projects/${notification.projectId}/work-items/${notification.workItemId}`;
    } else if (notification.sprintId) {
      actionUrl = `${baseUrl}/projects/${notification.projectId}/sprints/${notification.sprintId}`;
    }
  }
  
  return {
    subject: notification.title,
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0;">${notification.title}</h2>
        </div>
        
        <div style="padding: 20px 0;">
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            ${notification.message}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionUrl}" 
             style="background: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            ${getActionTextForType(notification.type)}
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #9ca3af; font-size: 14px; text-align: center;">
            You received this notification from your project management platform.
            <br>
            <a href="${baseUrl}/settings/notifications" style="color: #3b82f6;">
              Manage your notification preferences
            </a>
          </p>
        </div>
      </div>
    `,
    text_content: `
${notification.title}

${notification.message}

View details: ${actionUrl}

---
Manage your notification preferences: ${baseUrl}/settings/notifications
    `
  };
}