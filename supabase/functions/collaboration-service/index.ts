// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

// Supabase Edge Function for real-time collaboration
// This function handles collaborative sessions, user presence, and real-time updates

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
      cursor?: {
        x: number;
        y: number;
      };
      selection?: {
        elementId: string;
        elementType: string;
        range?: {
          start: number;
          end: number;
        };
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
      range?: {
        start: number;
        end: number;
      };
    };
  };
}

interface CollaborativeSession {
  id: string;
  projectId: string;
  workItemId?: string;
  sessionType: 'work_item' | 'board' | 'planning' | 'retrospective';
  createdBy: string;
  participants: string[];
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface UserPresence {
  userId: string;
  userName: string;
  status: 'active' | 'idle' | 'away';
  lastSeen: string;
  currentPage?: string;
  cursor?: {
    x: number;
    y: number;
  };
  selection?: {
    elementId: string;
    elementType: string;
    range?: {
      start: number;
      end: number;
    };
  };
}

interface SessionInfo {
  session: CollaborativeSession;
  activeUsers: UserPresence[];
  totalParticipants: number;
  duration: number; // in minutes
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
    const { action, sessionId, projectId, workItemId, userId, data }: CollaborationRequest = await req.json()

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
      case 'create-session':
        if (!projectId || !userId || !data?.sessionType) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for create-session action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await createCollaborativeSession(supabaseClient, {
          projectId,
          workItemId,
          sessionType: data.sessionType,
          createdBy: userId,
          metadata: data.metadata
        });
        break;
        
      case 'join-session':
        if (!sessionId || !userId) {
          return new Response(
            JSON.stringify({ error: 'Missing sessionId or userId for join-session action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await joinSession(supabaseClient, sessionId, userId);
        break;
        
      case 'leave-session':
        if (!sessionId || !userId) {
          return new Response(
            JSON.stringify({ error: 'Missing sessionId or userId for leave-session action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await leaveSession(supabaseClient, sessionId, userId);
        break;
        
      case 'update-presence':
        if (!userId || !data?.presence) {
          return new Response(
            JSON.stringify({ error: 'Missing userId or presence data for update-presence action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await updateUserPresence(supabaseClient, userId, data.presence, projectId);
        break;
        
      case 'get-active-users':
        if (!projectId) {
          return new Response(
            JSON.stringify({ error: 'Missing projectId for get-active-users action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await getActiveUsers(supabaseClient, projectId);
        break;
        
      case 'send-cursor':
        if (!sessionId || !userId || !data?.cursor) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for send-cursor action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await sendCursorUpdate(supabaseClient, sessionId, userId, data.cursor);
        break;
        
      case 'send-selection':
        if (!sessionId || !userId || !data?.selection) {
          return new Response(
            JSON.stringify({ error: 'Missing required data for send-selection action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await sendSelectionUpdate(supabaseClient, sessionId, userId, data.selection);
        break;
        
      case 'get-session-info':
        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: 'Missing sessionId for get-session-info action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await getSessionInfo(supabaseClient, sessionId);
        break;
        
      case 'end-session':
        if (!sessionId || !userId) {
          return new Response(
            JSON.stringify({ error: 'Missing sessionId or userId for end-session action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await endSession(supabaseClient, sessionId, userId);
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
    console.error('Collaboration service error:', error);
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

// Helper functions for collaboration operations
async function createCollaborativeSession(supabase: ReturnType<typeof createClient>, sessionData: {
  projectId: string;
  workItemId?: string;
  sessionType: 'work_item' | 'board' | 'planning' | 'retrospective';
  createdBy: string;
  metadata?: Record<string, unknown>;
}): Promise<CollaborativeSession> {
  const { data, error } = await supabase
    .from('collaborative_sessions')
    .insert({
      project_id: sessionData.projectId,
      work_item_id: sessionData.workItemId,
      session_type: sessionData.sessionType,
      created_by: sessionData.createdBy,
      participants: [sessionData.createdBy],
      is_active: true,
      metadata: sessionData.metadata
    })
    .select()
    .single();
    
  if (error) throw error;
  
  const session: CollaborativeSession = {
    id: data.id,
    projectId: data.project_id,
    workItemId: data.work_item_id,
    sessionType: data.session_type,
    createdBy: data.created_by,
    participants: data.participants,
    isActive: data.is_active,
    metadata: data.metadata,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
  
  // Broadcast session creation
  await broadcastToProject(supabase, sessionData.projectId, 'session_created', session);
  
  return session;
}

async function joinSession(supabase: ReturnType<typeof createClient>, sessionId: string, userId: string): Promise<CollaborativeSession> {
  // Get current session
  const { data: session, error: sessionError } = await supabase
    .from('collaborative_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
    
  if (sessionError) throw sessionError;
  
  // Add user to participants if not already present
  const participants = session.participants || [];
  if (!participants.includes(userId)) {
    participants.push(userId);
    
    const { data: updatedSession, error: updateError } = await supabase
      .from('collaborative_sessions')
      .update({ participants })
      .eq('id', sessionId)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    // Broadcast user joined
    await broadcastToSession(supabase, sessionId, 'user_joined', { userId, sessionId });
    
    return {
      id: updatedSession.id,
      projectId: updatedSession.project_id,
      workItemId: updatedSession.work_item_id,
      sessionType: updatedSession.session_type,
      createdBy: updatedSession.created_by,
      participants: updatedSession.participants,
      isActive: updatedSession.is_active,
      metadata: updatedSession.metadata,
      createdAt: updatedSession.created_at,
      updatedAt: updatedSession.updated_at
    };
  }
  
  return {
    id: session.id,
    projectId: session.project_id,
    workItemId: session.work_item_id,
    sessionType: session.session_type,
    createdBy: session.created_by,
    participants: session.participants,
    isActive: session.is_active,
    metadata: session.metadata,
    createdAt: session.created_at,
    updatedAt: session.updated_at
  };
}

async function leaveSession(supabase: ReturnType<typeof createClient>, sessionId: string, userId: string): Promise<{ success: boolean }> {
  // Get current session
  const { data: session, error: sessionError } = await supabase
    .from('collaborative_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
    
  if (sessionError) throw sessionError;
  
  // Remove user from participants
  const participants = (session.participants || []).filter((id: string) => id !== userId);
  
  const { error: updateError } = await supabase
    .from('collaborative_sessions')
    .update({ participants })
    .eq('id', sessionId);
    
  if (updateError) throw updateError;
  
  // Broadcast user left
  await broadcastToSession(supabase, sessionId, 'user_left', { userId, sessionId });
  
  return { success: true };
}

async function updateUserPresence(supabase: ReturnType<typeof createClient>, userId: string, presence: {
  status: 'active' | 'idle' | 'away';
  lastSeen: string;
  currentPage?: string;
  cursor?: { x: number; y: number };
  selection?: {
    elementId: string;
    elementType: string;
    range?: { start: number; end: number };
  };
}, projectId?: string): Promise<UserPresence> {
  const { data, error } = await supabase
    .from('user_presence')
    .upsert({
      user_id: userId,
      project_id: projectId,
      status: presence.status,
      last_seen: presence.lastSeen,
      current_page: presence.currentPage,
      cursor_position: presence.cursor,
      selection_data: presence.selection
    })
    .select(`
      *,
      users!inner(id, email, full_name)
    `)
    .single();
    
  if (error) throw error;
  
  const userPresence: UserPresence = {
    userId: data.user_id,
    userName: data.users.full_name || data.users.email,
    status: data.status,
    lastSeen: data.last_seen,
    currentPage: data.current_page,
    cursor: data.cursor_position,
    selection: data.selection_data
  };
  
  // Broadcast presence update
  if (projectId) {
    await broadcastToProject(supabase, projectId, 'presence_updated', userPresence);
  }
  
  return userPresence;
}

async function getActiveUsers(supabase: ReturnType<typeof createClient>, projectId: string): Promise<UserPresence[]> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('user_presence')
    .select(`
      *,
      users!inner(id, email, full_name)
    `)
    .eq('project_id', projectId)
    .gte('last_seen', fiveMinutesAgo)
    .order('last_seen', { ascending: false });
    
  if (error) throw error;
  
  return (data || []).map((presence: { 
    user_id: string;
    users: { 
      full_name: string;
      email: string;
    };
    status: 'active' | 'idle' | 'away';
    last_seen: string;
    current_page?: string;
    cursor_position?: {
      x: number;
      y: number;
    };
    selection_data?: {
      elementId: string;
      elementType: string;
      range?: {
        start: number;
        end: number;
      };
    };
  }) => ({
    userId: presence.user_id,
    userName: presence.users.full_name || presence.users.email,
    status: presence.status,
    lastSeen: presence.last_seen,
    currentPage: presence.current_page,
    cursor: presence.cursor_position,
    selection: presence.selection_data
  }));
}

async function sendCursorUpdate(supabase: ReturnType<typeof createClient>, sessionId: string, userId: string, cursor: {
  x: number;
  y: number;
  elementId?: string;
}): Promise<{ success: boolean }> {
  // Broadcast cursor update to session participants
  await broadcastToSession(supabase, sessionId, 'cursor_update', {
    userId,
    cursor
  });
  
  return { success: true };
}

async function sendSelectionUpdate(supabase: ReturnType<typeof createClient>, sessionId: string, userId: string, selection: {
  elementId: string;
  elementType: string;
  range?: { start: number; end: number };
}): Promise<{ success: boolean }> {
  // Broadcast selection update to session participants
  await broadcastToSession(supabase, sessionId, 'selection_update', {
    userId,
    selection
  });
  
  return { success: true };
}

async function getSessionInfo(supabase: ReturnType<typeof createClient>, sessionId: string): Promise<SessionInfo> {
  const { data: session, error: sessionError } = await supabase
    .from('collaborative_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
    
  if (sessionError) throw sessionError;
  
  // Get active users in the session
  const activeUsers = await getActiveUsersInSession(supabase, sessionId, session.participants);
  
  // Calculate session duration
  const duration = Math.floor((new Date().getTime() - new Date(session.created_at).getTime()) / (1000 * 60));
  
  return {
    session: {
      id: session.id,
      projectId: session.project_id,
      workItemId: session.work_item_id,
      sessionType: session.session_type,
      createdBy: session.created_by,
      participants: session.participants,
      isActive: session.is_active,
      metadata: session.metadata,
      createdAt: session.created_at,
      updatedAt: session.updated_at
    },
    activeUsers,
    totalParticipants: session.participants?.length || 0,
    duration
  };
}

async function endSession(supabase: ReturnType<typeof createClient>, sessionId: string, userId: string): Promise<{ success: boolean }> {
  // Check if user is the creator or has permission to end session
  const { data: session, error: sessionError } = await supabase
    .from('collaborative_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
    
  if (sessionError) throw sessionError;
  
  if (session.created_by !== userId) {
    throw new Error('Only session creator can end the session');
  }
  
  const { error: updateError } = await supabase
    .from('collaborative_sessions')
    .update({ is_active: false })
    .eq('id', sessionId);
    
  if (updateError) throw updateError;
  
  // Broadcast session ended
  await broadcastToSession(supabase, sessionId, 'session_ended', { sessionId, endedBy: userId });
  
  return { success: true };
}

async function getActiveUsersInSession(supabase: ReturnType<typeof createClient>, sessionId: string, participants: string[]): Promise<UserPresence[]> {
  if (!participants || participants.length === 0) return [];
  
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('user_presence')
    .select(`
      *,
      users!inner(id, email, full_name)
    `)
    .in('user_id', participants)
    .gte('last_seen', fiveMinutesAgo)
    .order('last_seen', { ascending: false });
    
  if (error) throw error;
  
  return (data || []).map((presence: {
    user_id: string;
    users: {
      full_name: string;
      email: string;
    };
    status: 'active' | 'idle' | 'away';
    last_seen: string;
    current_page?: string;
    cursor_position?: {
      x: number;
      y: number;
    };
    selection_data?: {
      elementId: string;
      elementType: string;
      range?: {
        start: number;
        end: number;
      };
    };
  }) => ({
    userId: presence.user_id,
    userName: presence.users.full_name || presence.users.email,
    status: presence.status,
    lastSeen: presence.last_seen,
    currentPage: presence.current_page,
    cursor: presence.cursor_position,
    selection: presence.selection_data
  }));
}

async function broadcastToSession(supabase: ReturnType<typeof createClient>, _sessionId: string, event: string, payload: unknown): Promise<void> {
  try {
    await supabase
      .channel(`session:${_sessionId}`)
      .send({
        type: 'broadcast',
        event,
        payload
      });
  } catch (error) {
    console.error('Failed to broadcast to session:', error);
  }
}

async function broadcastToProject(supabase: ReturnType<typeof createClient>, projectId: string, event: string, payload: unknown): Promise<void> {
  try {
    await supabase
      .channel(`project:${projectId}`)
      .send({
        type: 'broadcast',
        event,
        payload
      });
  } catch (error) {
    console.error('Failed to broadcast to project:', error);
  }
}