export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          filename: string
          id: string
          mime_type: string
          user_id: string
          work_item_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          filename: string
          id?: string
          mime_type: string
          user_id: string
          work_item_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          filename?: string
          id?: string
          mime_type?: string
          user_id?: string
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_work_item_id_fkey"
            columns: ["work_item_id"]
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          work_item_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          work_item_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_work_item_id_fkey"
            columns: ["work_item_id"]
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          }
        ]
      }
      project_members: {
        Row: {
          id: string
          joined_at: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          methodology: Database["public"]["Enums"]["methodology_type"]
          name: string
          owner_id: string
          settings: Json
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          methodology: Database["public"]["Enums"]["methodology_type"]
          name: string
          owner_id: string
          settings?: Json
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          methodology?: Database["public"]["Enums"]["methodology_type"]
          name?: string
          owner_id?: string
          settings?: Json
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_workflow_id_fkey"
            columns: ["workflow_id"]
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          }
        ]
      }
      sprints: {
        Row: {
          capacity: number
          created_at: string
          end_date: string
          goal: string | null
          id: string
          name: string
          project_id: string
          retrospective_notes: string | null
          start_date: string
          status: Database["public"]["Enums"]["sprint_status"]
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          end_date: string
          goal?: string | null
          id?: string
          name: string
          project_id: string
          retrospective_notes?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["sprint_status"]
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          end_date?: string
          goal?: string | null
          id?: string
          name?: string
          project_id?: string
          retrospective_notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["sprint_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprints_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      work_item_dependencies: {
        Row: {
          created_at: string
          depends_on_id: string
          id: string
          work_item_id: string
        }
        Insert: {
          created_at?: string
          depends_on_id: string
          id?: string
          work_item_id: string
        }
        Update: {
          created_at?: string
          depends_on_id?: string
          id?: string
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_item_dependencies_depends_on_id_fkey"
            columns: ["depends_on_id"]
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_item_dependencies_work_item_id_fkey"
            columns: ["work_item_id"]
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          }
        ]
      }
      work_items: {
        Row: {
          actual_time: number | null
          assignee_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimate: number | null
          id: string
          labels: string[]
          parent_id: string | null
          position: number
          priority: Database["public"]["Enums"]["priority_type"]
          project_id: string
          reporter_id: string
          sprint_id: string | null
          status: string
          title: string
          type: Database["public"]["Enums"]["work_item_type"]
          updated_at: string
        }
        Insert: {
          actual_time?: number | null
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimate?: number | null
          id?: string
          labels?: string[]
          parent_id?: string | null
          position?: number
          priority?: Database["public"]["Enums"]["priority_type"]
          project_id: string
          reporter_id: string
          sprint_id?: string | null
          status: string
          title: string
          type: Database["public"]["Enums"]["work_item_type"]
          updated_at?: string
        }
        Update: {
          actual_time?: number | null
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimate?: number | null
          id?: string
          labels?: string[]
          parent_id?: string | null
          position?: number
          priority?: Database["public"]["Enums"]["priority_type"]
          project_id?: string
          reporter_id?: string
          sprint_id?: string | null
          status?: string
          title?: string
          type?: Database["public"]["Enums"]["work_item_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_items_assignee_id_fkey"
            columns: ["assignee_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_items_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_items_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_items_reporter_id_fkey"
            columns: ["reporter_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_items_sprint_id_fkey"
            columns: ["sprint_id"]
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          }
        ]
      }
      workflow_states: {
        Row: {
          category: Database["public"]["Enums"]["workflow_state_category"]
          color: string
          created_at: string
          id: string
          name: string
          position: number
          wip_limit: number | null
          workflow_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["workflow_state_category"]
          color?: string
          created_at?: string
          id?: string
          name: string
          position?: number
          wip_limit?: number | null
          workflow_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["workflow_state_category"]
          color?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          wip_limit?: number | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_states_workflow_id_fkey"
            columns: ["workflow_id"]
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          }
        ]
      }
      workflow_transitions: {
        Row: {
          created_at: string
          from_state_id: string
          id: string
          to_state_id: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          from_state_id: string
          id?: string
          to_state_id: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          from_state_id?: string
          id?: string
          to_state_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_transitions_from_state_id_fkey"
            columns: ["from_state_id"]
            referencedRelation: "workflow_states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_transitions_to_state_id_fkey"
            columns: ["to_state_id"]
            referencedRelation: "workflow_states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_transitions_workflow_id_fkey"
            columns: ["workflow_id"]
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          }
        ]
      }
      workflows: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          methodology: Database["public"]["Enums"]["methodology_type"]
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          methodology: Database["public"]["Enums"]["methodology_type"]
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          methodology?: Database["public"]["Enums"]["methodology_type"]
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_sprint_velocity: {
        Args: {
          p_project_id: string
          p_sprint_count?: number
        }
        Returns: number
      }
      check_wip_limit: {
        Args: {
          p_project_id: string
          p_status: string
        }
        Returns: boolean
      }
      get_available_transitions: {
        Args: {
          p_work_item_id: string
        }
        Returns: {
          state_name: string
          state_color: string
        }[]
      }
      get_project_metrics: {
        Args: {
          p_project_id: string
        }
        Returns: Json
      }
      get_sprint_burndown: {
        Args: {
          p_sprint_id: string
        }
        Returns: {
          date: string
          remaining_points: number
          ideal_remaining: number
        }[]
      }
      validate_workflow_transition: {
        Args: {
          p_workflow_id: string
          p_from_state: string
          p_to_state: string
        }
        Returns: boolean
      }
    }
    Enums: {
      methodology_type: "scrum" | "kanban" | "waterfall" | "custom"
      priority_type: "low" | "medium" | "high" | "critical"
      project_role: "owner" | "admin" | "member" | "viewer"
      sprint_status: "planning" | "active" | "completed"
      work_item_type: "story" | "task" | "bug" | "epic"
      workflow_state_category: "todo" | "in_progress" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}