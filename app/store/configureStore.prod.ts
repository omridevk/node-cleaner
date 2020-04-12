import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { Store, projectsStateType } from '../reducers/types';
import createRootReducer from './index';

const history = createHashHistory();
const rootReducer = createRootReducer(history);
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function configureStore(initialState?: projectsStateType): Store {
    return createStore(rootReducer, initialState, enhancer);
}

export default { configureStore, history };
