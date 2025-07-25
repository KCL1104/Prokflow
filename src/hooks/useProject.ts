import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import type { Project } from '../types';

interface ProjectState {
    project: Project | null;
    loading: boolean;
    error: string | null;
}

export function useProject(projectId?: string) {
    const [state, setState] = useState<ProjectState>({
        project: null,
        loading: false,
        error: null
    });

    const fetchProject = useCallback(async (id: string) => {
        setState(prev => ({
            ...prev,
            loading: true,
            error: null
        }));

        try {
            const projectData = await projectService.getProject(id);
            setState({ project: projectData, loading: false, error: null });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project';
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, []);

    useEffect(() => {
        if (projectId) {
            fetchProject(projectId);
        }
    }, [projectId, fetchProject]);

    const createProject = useCallback(async (data: Parameters<typeof projectService.createProject>[0]) => {
        setState(prev => ({
            ...prev,
            loading: true,
            error: null
        }));

        try {
            const newProject = await projectService.createProject(data);
            setState({ project: newProject, loading: false, error: null });
            return newProject;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
            throw err;
        }
    }, []);

    const updateProject = useCallback(async (id: string, data: Parameters<typeof projectService.updateProject>[1]) => {
        setState(prev => ({
            ...prev,
            loading: true,
            error: null
        }));

        try {
            const updatedProject = await projectService.updateProject(id, data);
            setState({ project: updatedProject, loading: false, error: null });
            return updatedProject;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
            setState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
            throw err;
        }
    }, []);

    return {
        project: state.project,
        loading: state.loading,
        error: state.error,
        fetchProject,
        createProject,
        updateProject,
    };
}