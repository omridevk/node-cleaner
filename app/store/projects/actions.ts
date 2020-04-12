import {
    ADD_PROJECTS,
    DELETE_PROJECTS,
    Project,
    ProjectActionTypes
} from './types';

export function deleteProjects(
    projects: Project | Project[]
): ProjectActionTypes {
    return {
        type: DELETE_PROJECTS,
        payload: projects
    };
}

export function addProjects(projects: Project | Project[]): ProjectActionTypes {
    return {
        type: ADD_PROJECTS,
        payload: projects
    };
}
