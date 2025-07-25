import { supabase, getCurrentUserId } from '../lib/supabase';
import type { 
  Project, 
  TeamMember, 
  CreateProjectRequest, 
  UpdateProjectRequest,
  Database 
} from '../types';

type DbProject = Database['public']['Tables']['projects']['Row'];
type DbProjectMember = Database['public']['Tables']['project_members']['Row'];

export interface ProjectService {
  createProject(data: CreateProjectRequest): Promise<Project>;
  getProject(id: string): Promise<Project>;
  updateProject(id: string, data: UpdateProjectRequest): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  getProjectMembers(id: string): Promise<TeamMember[]>;
  addTeamMember(projectId: string, userId: string, role: string): Promise<void>;
  removeTeamMember(projectId: string, userId: string): Promise<void>;
  updateTeamMemberRole(projectId: string, userId: string, role: string): Promise<void>;
  getUserProjects(userId?: string): Promise<Project[]>;
}

// Helper function to transform database project to domain model
function transformDbProject(dbProject: DbProject, teamMembers: TeamMember[] = []): Project {
  return {
    id: dbProject.id,
    name: dbProject.name,
    description: dbProject.description || '',
    methodology: dbProject.methodology,
    workflowId: dbProject.workflow_id,
    ownerId: dbProject.owner_id,
    teamMembers,
    settings: (dbProject.settings as any) || {
      workingDays: [1, 2, 3, 4, 5],
      timezone: 'UTC',
      estimationUnit: 'story_points' as const
    },
    createdAt: new Date(dbProject.created_at),
    updatedAt: new Date(dbProject.updated_at)
  };
}

// Helper function to transform database team member to domain model
function transformDbTeamMember(dbMember: DbProjectMember): TeamMember {
  return {
    id: dbMember.id,
    userId: dbMember.user_id,
    projectId: dbMember.project_id,
    role: dbMember.role,
    joinedAt: new Date(dbMember.joined_at)
  };
}

export const projectService: ProjectService = {
  async createProject(data: CreateProjectRequest): Promise<Project> {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User must be authenticated to create a project');
    }

    // Get default workflow for the methodology
    const { data: workflows, error: workflowError } = await supabase
      .from('workflows')
      .select('id')
      .eq('methodology', data.methodology)
      .eq('is_default', true)
      .limit(1);

    if (workflowError) {
      throw new Error(`Failed to get default workflow: ${workflowError.message}`);
    }

    if (!workflows || workflows.length === 0) {
      throw new Error(`No default workflow found for methodology: ${data.methodology}`);
    }

    const workflowId = workflows[0].id;

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: data.name,
        description: data.description,
        methodology: data.methodology,
        workflow_id: workflowId,
        owner_id: currentUserId,
        settings: data.settings || {}
      })
      .select()
      .single();

    if (projectError) {
      throw new Error(`Failed to create project: ${projectError.message}`);
    }

    // Add the creator as the project owner
    const { error: memberError } = await supabase
      .from('project_members')
      .insert({
        project_id: project.id,
        user_id: currentUserId,
        role: 'owner'
      });

    if (memberError) {
      throw new Error(`Failed to add project owner: ${memberError.message}`);
    }

    // Get the team members for the response
    const teamMembers = await this.getProjectMembers(project.id);

    return transformDbProject(project, teamMembers);
  },

  async getProject(id: string): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get project: ${error.message}`);
    }

    if (!project) {
      throw new Error('Project not found');
    }

    // Get team members
    const teamMembers = await this.getProjectMembers(id);

    return transformDbProject(project, teamMembers);
  },

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .update({
        name: data.name,
        description: data.description,
        settings: data.settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }

    if (!project) {
      throw new Error('Project not found');
    }

    // Get team members
    const teamMembers = await this.getProjectMembers(id);

    return transformDbProject(project, teamMembers);
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  },

  async getProjectMembers(id: string): Promise<TeamMember[]> {
    const { data: members, error } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', id)
      .order('joined_at');

    if (error) {
      throw new Error(`Failed to get project members: ${error.message}`);
    }

    return (members || []).map(transformDbTeamMember);
  },

  async addTeamMember(projectId: string, userId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role: role as any
      });

    if (error) {
      throw new Error(`Failed to add team member: ${error.message}`);
    }
  },

  async removeTeamMember(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to remove team member: ${error.message}`);
    }
  },

  async updateTeamMemberRole(projectId: string, userId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from('project_members')
      .update({ role: role as any })
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to update team member role: ${error.message}`);
    }
  },

  async getUserProjects(userId?: string): Promise<Project[]> {
    const currentUserId = userId || await getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User must be authenticated to get projects');
    }

    const { data: projectMembers, error } = await supabase
      .from('project_members')
      .select(`
        project_id,
        projects (*)
      `)
      .eq('user_id', currentUserId);

    if (error) {
      throw new Error(`Failed to get user projects: ${error.message}`);
    }

    if (!projectMembers || projectMembers.length === 0) {
      return [];
    }

    // Batch fetch all team members for all projects
    const projectIds = projectMembers.map(member => member.project_id);
    const { data: allTeamMembers, error: teamError } = await supabase
      .from('project_members')
      .select('*')
      .in('project_id', projectIds)
      .order('joined_at');

    if (teamError) {
      throw new Error(`Failed to get team members: ${teamError.message}`);
    }

    // Group team members by project
    const teamMembersByProject = (allTeamMembers || []).reduce((acc, member) => {
      if (!acc[member.project_id]) {
        acc[member.project_id] = [];
      }
      acc[member.project_id].push(transformDbTeamMember(member));
      return acc;
    }, {} as Record<string, TeamMember[]>);

    // Transform projects with their team members
    const projects: Project[] = [];
    for (const member of projectMembers) {
      if (member.projects) {
        const teamMembers = teamMembersByProject[member.project_id] || [];
        projects.push(transformDbProject(member.projects as any, teamMembers));
      }
    }

    return projects;
  }
};