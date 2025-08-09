import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  // Theme and appearance
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  
  // Modals and dialogs
  modals: {
    createWorkItem: boolean;
    editWorkItem: boolean;
    createProject: boolean;
    editProject: boolean;
    createSprint: boolean;
    editSprint: boolean;
    userProfile: boolean;
    settings: boolean;
    notifications: boolean;
    help: boolean;
  };
  
  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Toast notifications
  toasts: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    timestamp: number;
  }[];
  
  // Page states
  currentPage: string;
  breadcrumbs: {
    label: string;
    path?: string;
  }[];
  
  // View preferences
  viewPreferences: {
    boardView: 'kanban' | 'list';
    backlogView: 'detailed' | 'compact';
    ganttView: 'months' | 'weeks' | 'days';
    reportsView: 'charts' | 'tables';
  };
  
  // Filters and search
  globalSearch: string;
  quickFilters: {
    assignedToMe: boolean;
    recentlyUpdated: boolean;
    highPriority: boolean;
    dueThisWeek: boolean;
  };
  
  // Layout and responsive
  isMobile: boolean;
  isTablet: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  // Performance monitoring
  performanceMetrics: {
    pageLoadTime: number;
    renderTime: number;
    apiResponseTime: number;
    lastMeasured: number;
  } | null;
}

const initialState: UIState = {
  theme: 'system',
  sidebarCollapsed: false,
  
  modals: {
    createWorkItem: false,
    editWorkItem: false,
    createProject: false,
    editProject: false,
    createSprint: false,
    editSprint: false,
    userProfile: false,
    settings: false,
    notifications: false,
    help: false,
  },
  
  globalLoading: false,
  loadingStates: {},
  
  toasts: [],
  
  currentPage: '',
  breadcrumbs: [],
  
  viewPreferences: {
    boardView: 'kanban',
    backlogView: 'detailed',
    ganttView: 'weeks',
    reportsView: 'charts',
  },
  
  globalSearch: '',
  quickFilters: {
    assignedToMe: false,
    recentlyUpdated: false,
    highPriority: false,
    dueThisWeek: false,
  },
  
  isMobile: false,
  isTablet: false,
  screenSize: 'lg',
  
  performanceMetrics: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme and appearance
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    
    // Modals and dialogs
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },
    
    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    setLoadingState: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      const { key, loading } = action.payload;
      if (loading) {
        state.loadingStates[key] = true;
      } else {
        delete state.loadingStates[key];
      }
    },
    clearLoadingStates: (state) => {
      state.loadingStates = {};
    },
    
    // Toast notifications
    addToast: (state, action: PayloadAction<Omit<UIState['toasts'][0], 'id' | 'timestamp'>>) => {
      const toast = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.toasts.push(toast);
      // Keep only last 10 toasts
      if (state.toasts.length > 10) {
        state.toasts = state.toasts.slice(-10);
      }
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // Page states
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action: PayloadAction<UIState['breadcrumbs']>) => {
      state.breadcrumbs = action.payload;
    },
    
    // View preferences
    setViewPreference: (state, action: PayloadAction<{ key: keyof UIState['viewPreferences']; value: UIState['viewPreferences'][keyof UIState['viewPreferences']] }>) => {
      const { key, value } = action.payload;
      (state.viewPreferences as any)[key] = value;
    },
    updateViewPreferences: (state, action: PayloadAction<Partial<UIState['viewPreferences']>>) => {
      state.viewPreferences = { ...state.viewPreferences, ...action.payload };
    },
    
    // Filters and search
    setGlobalSearch: (state, action: PayloadAction<string>) => {
      state.globalSearch = action.payload;
    },
    setQuickFilter: (state, action: PayloadAction<{ key: keyof UIState['quickFilters']; value: boolean }>) => {
      const { key, value } = action.payload;
      state.quickFilters[key] = value;
    },
    clearQuickFilters: (state) => {
      Object.keys(state.quickFilters).forEach(key => {
        state.quickFilters[key as keyof UIState['quickFilters']] = false;
      });
    },
    
    // Layout and responsive
    setScreenSize: (state, action: PayloadAction<{ size: UIState['screenSize']; isMobile: boolean; isTablet: boolean }>) => {
      const { size, isMobile, isTablet } = action.payload;
      state.screenSize = size;
      state.isMobile = isMobile;
      state.isTablet = isTablet;
    },
    
    // Performance monitoring
    setPerformanceMetrics: (state, action: PayloadAction<Omit<NonNullable<UIState['performanceMetrics']>, 'lastMeasured'>>) => {
      state.performanceMetrics = {
        ...action.payload,
        lastMeasured: Date.now(),
      };
    },
    
    // Reset
    reset: () => initialState,
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  openModal,
  closeModal,
  closeAllModals,
  setGlobalLoading,
  setLoadingState,
  clearLoadingStates,
  addToast,
  removeToast,
  clearToasts,
  setCurrentPage,
  setBreadcrumbs,
  setViewPreference,
  updateViewPreferences,
  setGlobalSearch,
  setQuickFilter,
  clearQuickFilters,
  setScreenSize,
  setPerformanceMetrics,
  reset,
} = uiSlice.actions;

export default uiSlice.reducer;