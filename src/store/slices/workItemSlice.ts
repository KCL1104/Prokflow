import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { WorkItem, WorkItemDependency, Comment, Attachment } from '../../types';

export interface WorkItemState {
  workItems: WorkItem[];
  selectedWorkItem: WorkItem | null;
  dependencies: WorkItemDependency[];
  comments: Comment[];
  attachments: Attachment[];
  isLoading: boolean;
  error: string | null;
  filters: {
    status: string[];
    assignee: string[];
    priority: string[];
    type: string[];
    sprint: string | null;
  };
  sortBy: 'priority' | 'created_at' | 'updated_at' | 'title';
  sortOrder: 'asc' | 'desc';
  lastUpdated: number | null;
}

const initialState: WorkItemState = {
  workItems: [],
  selectedWorkItem: null,
  dependencies: [],
  comments: [],
  attachments: [],
  isLoading: false,
  error: null,
  filters: {
    status: [],
    assignee: [],
    priority: [],
    type: [],
    sprint: null,
  },
  sortBy: 'priority',
  sortOrder: 'desc',
  lastUpdated: null,
};

// Async thunks
export const fetchWorkItems = createAsyncThunk(
  'workItem/fetchWorkItems',
  async (projectId: string, { rejectWithValue }) => {
    try {
      // TODO: Implement actual API call
      console.log('Fetching work items for project:', projectId);
      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch work items');
    }
  }
);

export const createWorkItem = createAsyncThunk(
  'workItem/createWorkItem',
  async (workItem: Omit<WorkItem, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      // TODO: Implement actual API call
      const newWorkItem: WorkItem = {
        ...workItem,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return newWorkItem;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create work item');
    }
  }
);

export const updateWorkItem = createAsyncThunk(
  'workItem/updateWorkItem',
  async ({ id, updates }: { id: string; updates: Partial<WorkItem> }, { rejectWithValue }) => {
    try {
      // TODO: Implement actual API call
      return { id, updates };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update work item');
    }
  }
);

export const deleteWorkItem = createAsyncThunk(
  'workItem/deleteWorkItem',
  async (id: string, { rejectWithValue }) => {
    try {
      // TODO: Implement actual API call
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete work item');
    }
  }
);

const workItemSlice = createSlice({
  name: 'workItem',
  initialState,
  reducers: {
    setWorkItems: (state, action: PayloadAction<WorkItem[]>) => {
      state.workItems = action.payload;
      state.lastUpdated = Date.now();
    },
    addWorkItem: (state, action: PayloadAction<WorkItem>) => {
      state.workItems.push(action.payload);
      state.lastUpdated = Date.now();
    },
    updateWorkItemLocal: (state, action: PayloadAction<{ id: string; updates: Partial<WorkItem> }>) => {
      const { id, updates } = action.payload;
      const index = state.workItems.findIndex(item => item.id === id);
      if (index !== -1) {
        state.workItems[index] = { ...state.workItems[index], ...updates, updatedAt: new Date() };
      }
      if (state.selectedWorkItem?.id === id) {
        state.selectedWorkItem = { ...state.selectedWorkItem, ...updates, updatedAt: new Date() };
      }
      state.lastUpdated = Date.now();
    },
    removeWorkItem: (state, action: PayloadAction<string>) => {
      state.workItems = state.workItems.filter(item => item.id !== action.payload);
      if (state.selectedWorkItem?.id === action.payload) {
        state.selectedWorkItem = null;
      }
      state.lastUpdated = Date.now();
    },
    setSelectedWorkItem: (state, action: PayloadAction<WorkItem | null>) => {
      state.selectedWorkItem = action.payload;
    },
    setDependencies: (state, action: PayloadAction<WorkItemDependency[]>) => {
      state.dependencies = action.payload;
    },
    addDependency: (state, action: PayloadAction<WorkItemDependency>) => {
      state.dependencies.push(action.payload);
    },
    removeDependency: (state, action: PayloadAction<string>) => {
      state.dependencies = state.dependencies.filter(dep => dep.id !== action.payload);
    },
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload;
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments.push(action.payload);
    },
    updateComment: (state, action: PayloadAction<Comment>) => {
      const index = state.comments.findIndex(comment => comment.id === action.payload.id);
      if (index !== -1) {
        state.comments[index] = action.payload;
      }
    },
    removeComment: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter(comment => comment.id !== action.payload);
    },
    setAttachments: (state, action: PayloadAction<Attachment[]>) => {
      state.attachments = action.payload;
    },
    addAttachment: (state, action: PayloadAction<Attachment>) => {
      state.attachments.push(action.payload);
    },
    removeAttachment: (state, action: PayloadAction<string>) => {
      state.attachments = state.attachments.filter(attachment => attachment.id !== action.payload);
    },
    setFilters: (state, action: PayloadAction<Partial<WorkItemState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSorting: (state, action: PayloadAction<{ sortBy: WorkItemState['sortBy']; sortOrder: WorkItemState['sortOrder'] }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
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
      // fetchWorkItems
      .addCase(fetchWorkItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workItems = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchWorkItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // createWorkItem
      .addCase(createWorkItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWorkItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workItems.push(action.payload);
        state.lastUpdated = Date.now();
      })
      .addCase(createWorkItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // updateWorkItem
      .addCase(updateWorkItem.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const index = state.workItems.findIndex(item => item.id === id);
        if (index !== -1) {
          state.workItems[index] = { ...state.workItems[index], ...updates, updatedAt: new Date() };
        }
        if (state.selectedWorkItem?.id === id) {
          state.selectedWorkItem = { ...state.selectedWorkItem, ...updates, updatedAt: new Date() };
        }
        state.lastUpdated = Date.now();
      })
      // deleteWorkItem
      .addCase(deleteWorkItem.fulfilled, (state, action) => {
        state.workItems = state.workItems.filter(item => item.id !== action.payload);
        if (state.selectedWorkItem?.id === action.payload) {
          state.selectedWorkItem = null;
        }
        state.lastUpdated = Date.now();
      });
  },
});

export const {
  setWorkItems,
  addWorkItem,
  updateWorkItemLocal,
  removeWorkItem,
  setSelectedWorkItem,
  setDependencies,
  addDependency,
  removeDependency,
  setComments,
  addComment,
  updateComment,
  removeComment,
  setAttachments,
  addAttachment,
  removeAttachment,
  setFilters,
  clearFilters,
  setSorting,
  setLoading,
  setError,
  clearError,
  reset,
} = workItemSlice.actions;

export default workItemSlice.reducer;