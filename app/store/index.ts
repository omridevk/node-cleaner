import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { projectsReducer } from './projects/reducers';
import { scanReducer } from './scan/reducers';

export default function createRootReducer(history: History) {
    return combineReducers({
        router: connectRouter(history),
        projects: projectsReducer,
        scan: scanReducer
    });
}
