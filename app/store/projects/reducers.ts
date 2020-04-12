import {
    ADD_PROJECTS,
    DELETE_PROJECTS,
    ProjectActionTypes,
    ProjectsState
} from './types';
import { without } from 'ramda';

const initialState: ProjectsState = {
    projects: []
};

export function projectsReducer(
    state = initialState,
    action: ProjectActionTypes
): ProjectsState {
    switch (action.type) {
        case ADD_PROJECTS:
            return {
                projects: [
                    ...state.projects,
                    ...(Array.isArray(action.payload)
                        ? action.payload
                        : [action.payload])
                ]
            };
        case DELETE_PROJECTS:
            let projects = Array.isArray(action.payload)
                ? action.payload
                : [action.payload];
            return {
                projects: without(projects, state.projects)
            };
        default:
            return state;
    }
}
