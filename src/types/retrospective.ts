export interface RetrospectiveItem {
  id: string;
  retrospectiveId: string;
  type: 'went_well' | 'to_improve' | 'action_item';
  content: string;
  authorId: string;
  authorName: string;
  votes: number;
  voterIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Retrospective {
  id: string;
  projectId: string;
  sprintId?: string;
  title: string;
  description?: string;
  status: 'draft' | 'in_progress' | 'completed';
  facilitatorId: string;
  facilitatorName: string;
  items: RetrospectiveItem[];
  participants: string[];
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRetrospectiveRequest {
  projectId: string;
  sprintId?: string;
  title: string;
  description?: string;
  scheduledAt?: Date;
}

export interface UpdateRetrospectiveRequest {
  title?: string;
  description?: string;
  status?: 'draft' | 'in_progress' | 'completed';
  scheduledAt?: Date;
}

export interface CreateRetrospectiveItemRequest {
  retrospectiveId: string;
  type: 'went_well' | 'to_improve' | 'action_item';
  content: string;
}

export interface UpdateRetrospectiveItemRequest {
  content?: string;
}

export interface VoteRetrospectiveItemRequest {
  itemId: string;
  vote: boolean; // true to add vote, false to remove vote
}