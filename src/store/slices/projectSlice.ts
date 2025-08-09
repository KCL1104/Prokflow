import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Project, TeamMember, Sprint } from '../../types';

export interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  projectMembers: TeamMember[];
  sprints: Sprint[];
  activeSprint: Sprint | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: ProjectState = {
  currentProject: null,
  projects: [],
  projectMembers: [],
  sprints: [],
  activeSprint: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks would be implemented here with actual API calls
export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Implement actual API call
      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch projects');
    }
  }
);

export const fetchProjectMembers = createAsyncThunk(
  'project/fetchProjectMembers',
  async (projectId: string, { rejectWithValue }) => {
    try {
      // TODO: Implement actual API call
      console.log('Fetching members for project:', projectId);
      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch project members');
    }
  }
);

export const fetchSprints = createAsyncThunk(
  'project/fetchSprints',
  async (projectId: string, { rejectWithValue }) => {
    try {
      // TODO: Implement actual API call
      console.log('Fetching sprints for project:', projectId);
      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch sprints');
    }
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
      state.lastUpdated = Date.now();
    },
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
      state.lastUpdated = Date.now();
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
      state.lastUpdated = Date.now();
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = action.payload;
      }
      state.lastUpdated = Date.now();
    },
    removeProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
      state.lastUpdated = Date.now();
    },
    setProjectMembers: (state, action: PayloadAction<TeamMember[]>) => {
      state.projectMembers = action.payload;
    },
    addProjectMember: (state, action: PayloadAction<TeamMember>) => {
      state.projectMembers.push(action.payload);
    },
    removeProjectMember: (state, action: PayloadAction<string>) => {
      state.projectMembers = state.projectMembers.filter((m: TeamMember) => m.id !== action.payload);
    },
    setSprints: (state, action: PayloadAction<Sprint[]>) => {
      state.sprints = action.payload;
      // Find active sprint
      const activeSprint = action.payload.find(s => s.status === 'active');
      state.activeSprint = activeSprint || null;
    },
    addSprint: (state, action: PayloadAction<Sprint>) => {
      state.sprints.push(action.payload);
      if (action.payload.status === 'active') {
        state.activeSprint = action.payload;
      }
    },
    updateSprint: (state, action: PayloadAction<Sprint>) => {
      const index = state.sprints.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sprints[index] = action.payload;
      }
      if (action.payload.status === 'active') {
        state.activeSprint = action.payload;
      } else if (state.activeSprint?.id === action.payload.id) {
        // If the active sprint is no longer active, find new active sprint
        const newActiveSprint = state.sprints.find(s => s.status === 'active');
        state.activeSprint = newActiveSprint || null;
      }
    },
    setActiveSprint: (state, action: PayloadAction<Sprint | null>) => {
      state.activeSprint = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchProjectMembers
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.projectMembers = action.payload;
      })
      // fetchSprints
      .addCase(fetchSprints.fulfilled, (state, action) => {
        state.sprints = action.payload;
        const activeSprint = action.payload.find((s: Sprint) => s.status === 'active');
        state.activeSprint = activeSprint || null;
      });
  },
});

export const {
  setCurrentProject,
  setProjects,
  addProject,
  updateProject,
  removeProject,
  setProjectMembers,
  addProjectMember,
  removeProjectMember,
  setSprints,
  addSprint,
  updateSprint,
  setActiveSprint,
  setLoading,
  setError,
  clearError,
  reset,
} = projectSlice.actions;

export default projectSlice.reducer;