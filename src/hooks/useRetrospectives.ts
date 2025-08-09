import { useState, useEffect, useCallback } from 'react';
import { retrospectiveService } from '../services/retrospectiveService';
import type {
  Retrospective,
  RetrospectiveFeedback,
  RetrospectiveActionItem,
  RetrospectiveTemplate,
  CreateRetrospectiveRequest,
  UpdateRetrospectiveRequest,
  CreateRetrospectiveFeedbackRequest,
  UpdateRetrospectiveFeedbackRequest,
  CreateRetrospectiveActionItemRequest,
  UpdateRetrospectiveActionItemRequest,
  CreateRetrospectiveTemplateRequest,
  AsyncState
} from '../types';

export const useRetrospectives = (projectId?: string) => {
  const [retrospectives, setRetrospectives] = useState<AsyncState<Retrospective[]>>({
    data: null,
    status: 'idle',
    error: null
  });

  const [templates, setTemplates] = useState<AsyncState<RetrospectiveTemplate[]>>({
    data: null,
    status: 'idle',
    error: null
  });

  // Fetch project retrospectives
  const fetchRetrospectives = useCallback(async () => {
    if (!projectId) return;

    setRetrospectives(prev => ({ ...prev, status: 'loading' }));
    
    try {
      const response = await retrospectiveService.getProjectRetrospectives(projectId);
      setRetrospectives({
        data: response.data,
        status: 'succeeded',
        error: null
      });
    } catch (error) {
      setRetrospectives({
        data: null,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to fetch retrospectives'
      });
    }
  }, [projectId]);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setTemplates(prev => ({ ...prev, status: 'loading' }));
    
    try {
      const response = await retrospectiveService.getTemplates();
      setTemplates({
        data: response.data,
        status: 'succeeded',
        error: null
      });
    } catch (error) {
      setTemplates({
        data: null,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to fetch templates'
      });
    }
  }, []);

  // Create retrospective
  const createRetrospective = useCallback(async (data: CreateRetrospectiveRequest): Promise<Retrospective> => {
    const response = await retrospectiveService.createRetrospective(data);
    
    // Update local state
    setRetrospectives(prev => ({
      ...prev,
      data: prev.data ? [response.data, ...prev.data] : [response.data]
    }));
    
    return response.data;
  }, []);

  // Update retrospective
  const updateRetrospective = useCallback(async (id: string, data: UpdateRetrospectiveRequest): Promise<Retrospective> => {
    const response = await retrospectiveService.updateRetrospective(id, data);
    
    // Update local state
    setRetrospectives(prev => ({
      ...prev,
      data: prev.data?.map(retro => 
        retro.id === id ? response.data : retro
      ) || null
    }));
    
    return response.data;
  }, []);

  // Delete retrospective
  const deleteRetrospective = useCallback(async (id: string): Promise<void> => {
    await retrospectiveService.deleteRetrospective(id);
    
    // Update local state
    setRetrospectives(prev => ({
      ...prev,
      data: prev.data?.filter(retro => retro.id !== id) || null
    }));
  }, []);

  // Create template
  const createTemplate = useCallback(async (data: CreateRetrospectiveTemplateRequest): Promise<RetrospectiveTemplate> => {
    const response = await retrospectiveService.createTemplate(data);
    
    // Update local state
    setTemplates(prev => ({
      ...prev,
      data: prev.data ? [...prev.data, response.data] : [response.data]
    }));
    
    return response.data;
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchRetrospectives();
    }
  }, [fetchRetrospectives, projectId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    retrospectives: retrospectives.data || [],
    retrospectivesLoading: retrospectives.status === 'loading',
    retrospectivesError: retrospectives.error,
    templates: templates.data || [],
    templatesLoading: templates.status === 'loading',
    templatesError: templates.error,
    createRetrospective,
    updateRetrospective,
    deleteRetrospective,
    createTemplate,
    refetchRetrospectives: fetchRetrospectives,
    refetchTemplates: fetchTemplates
  };
};

export const useRetrospective = (retrospectiveId?: string) => {
  const [retrospective, setRetrospective] = useState<AsyncState<Retrospective>>({
    data: null,
    status: 'idle',
    error: null
  });

  // Fetch single retrospective
  const fetchRetrospective = useCallback(async () => {
    if (!retrospectiveId) return;

    setRetrospective(prev => ({ ...prev, status: 'loading' }));
    
    try {
      const response = await retrospectiveService.getRetrospective(retrospectiveId);
      setRetrospective({
        data: response.data,
        status: 'succeeded',
        error: null
      });
    } catch (error) {
      setRetrospective({
        data: null,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to fetch retrospective'
      });
    }
  }, [retrospectiveId]);

  // Add feedback
  const addFeedback = useCallback(async (data: CreateRetrospectiveFeedbackRequest): Promise<RetrospectiveFeedback> => {
    const response = await retrospectiveService.createFeedback(data);
    
    // Update local state
    setRetrospective(prev => ({
      ...prev,
      data: prev.data ? {
        ...prev.data,
        feedback: [...(prev.data.feedback || []), response.data]
      } : null
    }));
    
    return response.data;
  }, []);

  // Update feedback
  const updateFeedback = useCallback(async (id: string, data: UpdateRetrospectiveFeedbackRequest): Promise<RetrospectiveFeedback> => {
    const response = await retrospectiveService.updateFeedback(id, data);
    
    // Update local state
    setRetrospective(prev => ({
      ...prev,
      data: prev.data ? {
        ...prev.data,
        feedback: prev.data.feedback?.map(feedback => 
          feedback.id === id ? response.data : feedback
        ) || []
      } : null
    }));
    
    return response.data;
  }, []);

  // Delete feedback
  const deleteFeedback = useCallback(async (id: string): Promise<void> => {
    await retrospectiveService.deleteFeedback(id);
    
    // Update local state
    setRetrospective(prev => ({
      ...prev,
      data: prev.data ? {
        ...prev.data,
        feedback: prev.data.feedback?.filter(feedback => feedback.id !== id) || []
      } : null
    }));
  }, []);

  // Vote feedback
  const voteFeedback = useCallback(async (id: string, increment: boolean = true): Promise<void> => {
    const response = await retrospectiveService.voteFeedback(id, increment);
    
    // Update local state
    setRetrospective(prev => ({
      ...prev,
      data: prev.data ? {
        ...prev.data,
        feedback: prev.data.feedback?.map(feedback => 
          feedback.id === id ? response.data : feedback
        ) || []
      } : null
    }));
  }, []);

  // Add action item
  const addActionItem = useCallback(async (data: CreateRetrospectiveActionItemRequest): Promise<RetrospectiveActionItem> => {
    const response = await retrospectiveService.createActionItem(data);
    
    // Update local state
    setRetrospective(prev => ({
      ...prev,
      data: prev.data ? {
        ...prev.data,
        actionItems: [...(prev.data.actionItems || []), response.data]
      } : null
    }));
    
    return response.data;
  }, []);

  // Update action item
  const updateActionItem = useCallback(async (id: string, data: UpdateRetrospectiveActionItemRequest): Promise<RetrospectiveActionItem> => {
    const response = await retrospectiveService.updateActionItem(id, data);
    
    // Update local state
    setRetrospective(prev => ({
      ...prev,
      data: prev.data ? {
        ...prev.data,
        actionItems: prev.data.actionItems?.map(item => 
          item.id === id ? response.data : item
        ) || []
      } : null
    }));
    
    return response.data;
  }, []);

  // Delete action item
  const deleteActionItem = useCallback(async (id: string): Promise<void> => {
    await retrospectiveService.deleteActionItem(id);
    
    // Update local state
    setRetrospective(prev => ({
      ...prev,
      data: prev.data ? {
        ...prev.data,
        actionItems: prev.data.actionItems?.filter(item => item.id !== id) || []
      } : null
    }));
  }, []);

  useEffect(() => {
    if (retrospectiveId) {
      fetchRetrospective();
    }
  }, [fetchRetrospective, retrospectiveId]);

  return {
    retrospective: retrospective.data,
    loading: retrospective.status === 'loading',
    error: retrospective.error,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    voteFeedback,
    addActionItem,
    updateActionItem,
    deleteActionItem,
    refetch: fetchRetrospective
  };
};