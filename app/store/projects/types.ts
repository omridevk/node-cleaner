export interface Project {
    name: string;
    path: string;
    size: number;
    deleteState: State;
    lastModified: Date | string;
    description: string;
}

export enum State {
    Default = 'default',
    Deleting = 'deleting',
    Deleted = 'deleted'
}

export interface ProjectsState {
    projects: Project[];
}

export const ADD_PROJECTS = 'ADD_PROJECTS';
export const DELETE_PROJECTS = 'DELETE_PROJECTS';

interface AddProjectsAction {
    type: typeof ADD_PROJECTS;
    payload: Project | Project[];
}

interface DeleteProjectsAction {
    type: typeof DELETE_PROJECTS;
    payload: Project | Project[];
}

export type ProjectActionTypes = AddProjectsAction | DeleteProjectsAction;
