export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

<<<<<<< HEAD
export interface Database {
=======
export type Database = {
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
  public: {
    Tables: {
      attachments: {
        Row: {
<<<<<<< HEAD
          created_at: string
=======
          created_at: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          file_path: string
          file_size: number
          filename: string
          id: string
          mime_type: string
          user_id: string
          work_item_id: string
        }
        Insert: {
<<<<<<< HEAD
          created_at?: string
=======
          created_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          file_path: string
          file_size: number
          filename: string
          id?: string
          mime_type: string
          user_id: string
          work_item_id: string
        }
        Update: {
<<<<<<< HEAD
          created_at?: string
=======
          created_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_work_item_id_fkey"
            columns: ["work_item_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          }
        ]
      }
      collaborative_sessions: {
        Row: {
          active_users: Json | null
          created_at: string | null
          id: string
          last_activity: string | null
          updated_at: string | null
          work_item_id: string
        }
        Insert: {
          active_users?: Json | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          updated_at?: string | null
          work_item_id: string
        }
        Update: {
          active_users?: Json | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          updated_at?: string | null
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborative_sessions_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: true
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          content: string
<<<<<<< HEAD
          created_at: string
          id: string
          updated_at: string
=======
          created_at: string | null
          id: string
          updated_at: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          user_id: string
          work_item_id: string
        }
        Insert: {
          content: string
<<<<<<< HEAD
          created_at?: string
          id?: string
          updated_at?: string
=======
          created_at?: string | null
          id?: string
          updated_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          user_id: string
          work_item_id: string
        }
        Update: {
          content?: string
<<<<<<< HEAD
          created_at?: string
          id?: string
          updated_at?: string
=======
          created_at?: string | null
          id?: string
          updated_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          user_id?: string
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_work_item_id_fkey"
            columns: ["work_item_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          comment_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          project_id: string
          sprint_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string | null
          user_id: string
          work_item_id: string | null
        }
        Insert: {
          action_url?: string | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          project_id: string
          sprint_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id: string
          work_item_id?: string | null
        }
        Update: {
          action_url?: string | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          project_id?: string
          sprint_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id?: string
          work_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          }
        ]
      }
      project_members: {
        Row: {
          id: string
<<<<<<< HEAD
          joined_at: string
=======
          joined_at: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Insert: {
          id?: string
<<<<<<< HEAD
          joined_at?: string
=======
          joined_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Update: {
          id?: string
<<<<<<< HEAD
          joined_at?: string
=======
          joined_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
<<<<<<< HEAD
          created_at: string
=======
          created_at: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          description: string | null
          id: string
          methodology: Database["public"]["Enums"]["methodology_type"]
          name: string
          owner_id: string
<<<<<<< HEAD
          settings: Json
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
=======
          settings: Json | null
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          description?: string | null
          id?: string
          methodology: Database["public"]["Enums"]["methodology_type"]
          name: string
          owner_id: string
<<<<<<< HEAD
          settings?: Json
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
=======
          settings?: Json | null
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          created_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          description?: string | null
          id?: string
          methodology?: Database["public"]["Enums"]["methodology_type"]
          name?: string
          owner_id?: string
<<<<<<< HEAD
          settings?: Json
          updated_at?: string
=======
          settings?: Json | null
          updated_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_workflow_id_fkey"
            columns: ["workflow_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          }
        ]
      }
<<<<<<< HEAD
      sprints: {
        Row: {
          capacity: number
          created_at: string
=======
      retrospective_action_items: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          retrospective_id: string
          status: Database["public"]["Enums"]["action_item_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          retrospective_id: string
          status?: Database["public"]["Enums"]["action_item_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          retrospective_id?: string
          status?: Database["public"]["Enums"]["action_item_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retrospective_action_items_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospective_action_items_retrospective_id_fkey"
            columns: ["retrospective_id"]
            isOneToOne: false
            referencedRelation: "retrospectives"
            referencedColumns: ["id"]
          }
        ]
      }
      retrospective_feedback: {
        Row: {
          category: Database["public"]["Enums"]["feedback_category"]
          content: string
          created_at: string | null
          id: string
          retrospective_id: string
          updated_at: string | null
          user_id: string
          votes: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["feedback_category"]
          content: string
          created_at?: string | null
          id?: string
          retrospective_id: string
          updated_at?: string | null
          user_id: string
          votes?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["feedback_category"]
          content?: string
          created_at?: string | null
          id?: string
          retrospective_id?: string
          updated_at?: string | null
          user_id?: string
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "retrospective_feedback_retrospective_id_fkey"
            columns: ["retrospective_id"]
            isOneToOne: false
            referencedRelation: "retrospectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospective_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      retrospective_templates: {
        Row: {
          categories: Json
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          categories: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          categories?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      retrospectives: {
        Row: {
          completed_at: string | null
          created_at: string | null
          facilitator_id: string
          id: string
          participants: string[] | null
          project_id: string
          scheduled_date: string | null
          sprint_id: string | null
          status: Database["public"]["Enums"]["retrospective_status"]
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          facilitator_id: string
          id?: string
          participants?: string[] | null
          project_id: string
          scheduled_date?: string | null
          sprint_id?: string | null
          status?: Database["public"]["Enums"]["retrospective_status"]
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          facilitator_id?: string
          id?: string
          participants?: string[] | null
          project_id?: string
          scheduled_date?: string | null
          sprint_id?: string | null
          status?: Database["public"]["Enums"]["retrospective_status"]
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retrospectives_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospectives_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospectives_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospectives_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "retrospective_templates"
            referencedColumns: ["id"]
          }
        ]
      }
      sprints: {
        Row: {
          capacity: number | null
          created_at: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          end_date: string
          goal: string | null
          id: string
          name: string
          project_id: string
          retrospective_notes: string | null
          start_date: string
          status: Database["public"]["Enums"]["sprint_status"]
<<<<<<< HEAD
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
=======
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          end_date: string
          goal?: string | null
          id?: string
          name: string
          project_id: string
          retrospective_notes?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["sprint_status"]
<<<<<<< HEAD
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
=======
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          end_date?: string
          goal?: string | null
          id?: string
          name?: string
          project_id?: string
          retrospective_notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["sprint_status"]
<<<<<<< HEAD
          updated_at?: string
=======
          updated_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        }
        Relationships: [
          {
            foreignKeyName: "sprints_project_id_fkey"
            columns: ["project_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
<<<<<<< HEAD
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
=======
      standup_participations: {
        Row: {
          blockers: string | null
          created_at: string | null
          id: string
          plans: string | null
          progress: string | null
          standup_id: string
          status: Database["public"]["Enums"]["standup_participation_status"]
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          blockers?: string | null
          created_at?: string | null
          id?: string
          plans?: string | null
          progress?: string | null
          standup_id: string
          status?: Database["public"]["Enums"]["standup_participation_status"]
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          blockers?: string | null
          created_at?: string | null
          id?: string
          plans?: string | null
          progress?: string | null
          standup_id?: string
          status?: Database["public"]["Enums"]["standup_participation_status"]
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "standup_participations_standup_id_fkey"
            columns: ["standup_id"]
            isOneToOne: false
            referencedRelation: "standups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standup_participations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      standup_reminders: {
        Row: {
          created_at: string | null
          id: string
          reminder_type: string
          scheduled_at: string
          sent_at: string | null
          standup_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reminder_type: string
          scheduled_at: string
          sent_at?: string | null
          standup_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reminder_type?: string
          scheduled_at?: string
          sent_at?: string | null
          standup_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "standup_reminders_standup_id_fkey"
            columns: ["standup_id"]
            isOneToOne: false
            referencedRelation: "standups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standup_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      standups: {
        Row: {
          created_at: string | null
          duration: number | null
          facilitator_id: string
          id: string
          notes: string | null
          participants: string[] | null
          project_id: string
          scheduled_date: string
          sprint_id: string | null
          status: Database["public"]["Enums"]["standup_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          facilitator_id: string
          id?: string
          notes?: string | null
          participants?: string[] | null
          project_id: string
          scheduled_date: string
          sprint_id?: string | null
          status?: Database["public"]["Enums"]["standup_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          facilitator_id?: string
          id?: string
          notes?: string | null
          participants?: string[] | null
          project_id?: string
          scheduled_date?: string
          sprint_id?: string | null
          status?: Database["public"]["Enums"]["standup_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "standups_facilitator_id_fkey"
            columns: ["facilitator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standups_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standups_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          timezone?: string | null
          updated_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
<<<<<<< HEAD
=======
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_email_preferences: {
        Row: {
          created_at: string | null
          id: string
          preferences: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          preferences: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          preferences?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_email_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      work_item_dependencies: {
        Row: {
<<<<<<< HEAD
          created_at: string
=======
          created_at: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          depends_on_id: string
          id: string
          work_item_id: string
        }
        Insert: {
<<<<<<< HEAD
          created_at?: string
=======
          created_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          depends_on_id: string
          id?: string
          work_item_id: string
        }
        Update: {
<<<<<<< HEAD
          created_at?: string
=======
          created_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          depends_on_id?: string
          id?: string
          work_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_item_dependencies_depends_on_id_fkey"
            columns: ["depends_on_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_item_dependencies_work_item_id_fkey"
            columns: ["work_item_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          }
        ]
      }
      work_items: {
        Row: {
          actual_time: number | null
          assignee_id: string | null
<<<<<<< HEAD
          created_at: string
=======
          created_at: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          description: string | null
          due_date: string | null
          estimate: number | null
          id: string
<<<<<<< HEAD
          labels: string[]
          parent_id: string | null
          position: number
=======
          labels: string[] | null
          parent_id: string | null
          position: number | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          priority: Database["public"]["Enums"]["priority_type"]
          project_id: string
          reporter_id: string
          sprint_id: string | null
          status: string
          title: string
          type: Database["public"]["Enums"]["work_item_type"]
<<<<<<< HEAD
          updated_at: string
=======
          updated_at: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        }
        Insert: {
          actual_time?: number | null
          assignee_id?: string | null
<<<<<<< HEAD
          created_at?: string
=======
          created_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          description?: string | null
          due_date?: string | null
          estimate?: number | null
          id?: string
<<<<<<< HEAD
          labels?: string[]
          parent_id?: string | null
          position?: number
=======
          labels?: string[] | null
          parent_id?: string | null
          position?: number | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          priority?: Database["public"]["Enums"]["priority_type"]
          project_id: string
          reporter_id: string
          sprint_id?: string | null
          status: string
          title: string
          type: Database["public"]["Enums"]["work_item_type"]
<<<<<<< HEAD
          updated_at?: string
=======
          updated_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        }
        Update: {
          actual_time?: number | null
          assignee_id?: string | null
<<<<<<< HEAD
          created_at?: string
=======
          created_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          description?: string | null
          due_date?: string | null
          estimate?: number | null
          id?: string
<<<<<<< HEAD
          labels?: string[]
          parent_id?: string | null
          position?: number
=======
          labels?: string[] | null
          parent_id?: string | null
          position?: number | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          priority?: Database["public"]["Enums"]["priority_type"]
          project_id?: string
          reporter_id?: string
          sprint_id?: string | null
          status?: string
          title?: string
          type?: Database["public"]["Enums"]["work_item_type"]
<<<<<<< HEAD
          updated_at?: string
=======
          updated_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
        }
        Relationships: [
          {
            foreignKeyName: "work_items_assignee_id_fkey"
            columns: ["assignee_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_items_parent_id_fkey"
            columns: ["parent_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_items_project_id_fkey"
            columns: ["project_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_items_reporter_id_fkey"
            columns: ["reporter_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_items_sprint_id_fkey"
            columns: ["sprint_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          }
        ]
      }
      workflow_states: {
        Row: {
          category: Database["public"]["Enums"]["workflow_state_category"]
<<<<<<< HEAD
          color: string
          created_at: string
          id: string
          name: string
          position: number
=======
          color: string | null
          created_at: string | null
          id: string
          name: string
          position: number | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          wip_limit: number | null
          workflow_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["workflow_state_category"]
<<<<<<< HEAD
          color?: string
          created_at?: string
          id?: string
          name: string
          position?: number
=======
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          position?: number | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          wip_limit?: number | null
          workflow_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["workflow_state_category"]
<<<<<<< HEAD
          color?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
=======
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          position?: number | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          wip_limit?: number | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_states_workflow_id_fkey"
            columns: ["workflow_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          }
        ]
      }
      workflow_transitions: {
        Row: {
<<<<<<< HEAD
          created_at: string
=======
          created_at: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          from_state_id: string
          id: string
          to_state_id: string
          workflow_id: string
        }
        Insert: {
<<<<<<< HEAD
          created_at?: string
=======
          created_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          from_state_id: string
          id?: string
          to_state_id: string
          workflow_id: string
        }
        Update: {
<<<<<<< HEAD
          created_at?: string
=======
          created_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
          from_state_id?: string
          id?: string
          to_state_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_transitions_from_state_id_fkey"
            columns: ["from_state_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "workflow_states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_transitions_to_state_id_fkey"
            columns: ["to_state_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "workflow_states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_transitions_workflow_id_fkey"
            columns: ["workflow_id"]
<<<<<<< HEAD
=======
            isOneToOne: false
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          }
        ]
      }
      workflows: {
        Row: {
<<<<<<< HEAD
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
=======
          created_at: string | null
          id: string
          is_default: boolean | null
          methodology: Database["public"]["Enums"]["methodology_type"]
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          methodology: Database["public"]["Enums"]["methodology_type"]
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          methodology?: Database["public"]["Enums"]["methodology_type"]
          name?: string
          updated_at?: string | null
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
    }
    Enums: {
      methodology_type: "scrum" | "kanban" | "waterfall" | "custom"
      priority_type: "low" | "medium" | "high" | "critical"
      project_role: "owner" | "admin" | "member" | "viewer"
      sprint_status: "planning" | "active" | "completed"
=======
      vote_retrospective_feedback: {
        Args: {
          feedback_id: string
          user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      action_item_status: "open" | "in_progress" | "completed" | "cancelled"
      feedback_category: "went_well" | "needs_improvement" | "action_items"
      methodology_type: "scrum" | "kanban" | "waterfall" | "custom"
      notification_type:
        | "work_item_updated"
        | "work_item_assigned"
        | "comment_added"
        | "mention"
        | "sprint_updated"
        | "sprint_started"
        | "sprint_ended"
        | "deadline_reminder"
        | "project_invitation"
      priority_type: "low" | "medium" | "high" | "critical"
      project_role: "owner" | "admin" | "member" | "viewer"
      retrospective_status: "draft" | "in_progress" | "completed"
      sprint_status: "planning" | "active" | "completed"
      standup_participation_status: "pending" | "submitted" | "skipped"
      standup_status: "scheduled" | "in_progress" | "completed" | "cancelled"
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
      work_item_type: "story" | "task" | "bug" | "epic"
      workflow_state_category: "todo" | "in_progress" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
<<<<<<< HEAD
}
=======
}

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
    ? U
    : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof Database
}
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
