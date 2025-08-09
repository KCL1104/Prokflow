/**
 * Test data fixtures for end-to-end tests
 */

export const testUsers = {
  projectOwner: {
    email: 'owner@test.com',
    password: 'testpassword123',
    name: 'Project Owner',
  },
  teamMember: {
    email: 'member@test.com',
    password: 'testpassword123',
    name: 'Team Member',
  },
  viewer: {
    email: 'viewer@test.com',
    password: 'testpassword123',
    name: 'Project Viewer',
  },
};

export const testProjects = {
  scrumProject: {
    name: 'E2E Scrum Project',
    description: 'A test project using Scrum methodology',
    methodology: 'scrum',
  },
  kanbanProject: {
    name: 'E2E Kanban Project',
    description: 'A test project using Kanban methodology',
    methodology: 'kanban',
  },
};

export const testWorkItems = {
  userStory: {
    title: 'User Registration Feature',
    description: 'As a user, I want to register for an account so that I can access the platform',
    type: 'story',
    priority: 'high',
    estimate: 8,
  },
  task: {
    title: 'Setup Database Schema',
    description: 'Create the initial database schema for user management',
    type: 'task',
    priority: 'medium',
    estimate: 5,
  },
  bug: {
    title: 'Login Button Not Working',
    description: 'The login button does not respond when clicked',
    type: 'bug',
    priority: 'critical',
  },
};

export const testSprints = {
  sprint1: {
    name: 'Sprint 1 - Foundation',
    goal: 'Set up the basic infrastructure and user management',
    duration: 14, // days
  },
  sprint2: {
    name: 'Sprint 2 - Core Features',
    goal: 'Implement core project management features',
    duration: 14,
  },
};

export const testComments = {
  workItemComment: {
    content: 'This looks good, but we should consider adding validation for email format.',
  },
  sprintComment: {
    content: 'Great progress on this sprint! The team velocity is improving.',
  },
};

export const testRetrospective = {
  wentWell: [
    'Team communication was excellent',
    'We delivered all planned features',
    'Code quality improved significantly',
  ],
  needsImprovement: [
    'Estimation accuracy needs work',
    'More testing is required',
    'Documentation could be better',
  ],
  actionItems: [
    'Schedule estimation training session',
    'Implement automated testing pipeline',
    'Create documentation templates',
  ],
};

export const testStandup = {
  yesterday: 'Completed user authentication implementation',
  today: 'Working on password reset functionality',
  blockers: 'Waiting for API documentation from backend team',
};

// Helper functions for generating test data
export const generateUniqueEmail = () => `test-${Date.now()}@example.com`;

export const generateProjectName = () => `Test Project ${Date.now()}`;

export const generateWorkItemTitle = () => `Test Work Item ${Date.now()}`;

export const generateSprintName = () => `Test Sprint ${Date.now()}`;

// Test data for performance testing
export const generateLargeDataset = (count: number) => ({
  workItems: Array.from({ length: count }, (_, i) => ({
    title: `Performance Test Item ${i + 1}`,
    description: `Description for performance test item ${i + 1}`,
    type: i % 3 === 0 ? 'story' : i % 3 === 1 ? 'task' : 'bug',
    priority: ['low', 'medium', 'high', 'critical'][i % 4],
    estimate: Math.floor(Math.random() * 13) + 1,
  })),
  sprints: Array.from({ length: Math.ceil(count / 10) }, (_, i) => ({
    name: `Performance Sprint ${i + 1}`,
    goal: `Complete performance test items ${i * 10 + 1}-${Math.min((i + 1) * 10, count)}`,
    duration: 14,
  })),
});

// Mock API responses for testing
export const mockApiResponses = {
  successfulLogin: {
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
    },
    session: {
      access_token: 'mock-access-token',
      expires_at: Date.now() + 3600000, // 1 hour from now
    },
  },
  projectCreated: {
    id: 'test-project-1',
    name: 'Test Project',
    methodology: 'scrum',
    created_at: new Date().toISOString(),
  },
  workItemCreated: {
    id: 'test-work-item-1',
    title: 'Test Work Item',
    status: 'To Do',
    created_at: new Date().toISOString(),
  },
};

// Test scenarios for different user journeys
export const userJourneys = {
  newUserOnboarding: {
    steps: [
      'Visit landing page',
      'Click sign up',
      'Fill registration form',
      'Verify email',
      'Complete profile setup',
      'Create first project',
    ],
  },
  projectManagerWorkflow: {
    steps: [
      'Login as project manager',
      'Create new project',
      'Set up project methodology',
      'Invite team members',
      'Create product backlog',
      'Plan first sprint',
      'Monitor sprint progress',
    ],
  },
  teamMemberWorkflow: {
    steps: [
      'Login as team member',
      'View assigned work items',
      'Update work item status',
      'Add comments to work items',
      'Participate in daily standup',
      'Complete retrospective',
    ],
  },
  stakeholderWorkflow: {
    steps: [
      'Login as stakeholder',
      'View project dashboard',
      'Check sprint progress',
      'Review completed work',
      'Generate progress reports',
    ],
  },
};

// Browser and device configurations for cross-platform testing
export const testEnvironments = {
  desktop: {
    chrome: { width: 1920, height: 1080 },
    firefox: { width: 1920, height: 1080 },
    safari: { width: 1920, height: 1080 },
  },
  tablet: {
    ipad: { width: 1024, height: 768 },
    androidTablet: { width: 1280, height: 800 },
  },
  mobile: {
    iphone: { width: 375, height: 667 },
    android: { width: 360, height: 640 },
  },
};

// Performance benchmarks
export const performanceBenchmarks = {
  pageLoadTime: 3000, // 3 seconds
  apiResponseTime: 1000, // 1 second
  dragDropResponseTime: 100, // 100ms
  searchResponseTime: 500, // 500ms
  chartRenderTime: 2000, // 2 seconds
};

// Accessibility testing data
export const accessibilityTests = {
  keyboardNavigation: [
    'Tab through all interactive elements',
    'Use arrow keys for navigation',
    'Press Enter to activate buttons',
    'Use Escape to close modals',
  ],
  screenReaderTests: [
    'Check ARIA labels',
    'Verify heading hierarchy',
    'Test form field descriptions',
    'Validate error messages',
  ],
  colorContrastTests: [
    'Primary text on background',
    'Secondary text on background',
    'Button text on button background',
    'Link text on background',
  ],
};