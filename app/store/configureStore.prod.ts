import { applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from './index';
import { configureStore } from '@reduxjs/toolkit';

const history = createHashHistory();
const rootReducer = createRootReducer(history);
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function createStore(initialState?: any) {
    return configureStore({
        reducer: rootReducer,
        enhancers: [enhancer],
        preloadedState: initialState
    });
}

export default { createStore, history };
