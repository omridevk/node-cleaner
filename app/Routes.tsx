import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Routes as RouteList } from './constants';
import App from './containers/App';
import HomePage from './containers/HomePage';
import ProjectsPage from './containers/ProjectsPage';
import { HistoryPage } from './containers/HistoryPage';

export default function Routes() {
    return (
        <App>
            <Switch>
                <Route path={RouteList.HISTORY} component={HistoryPage} />
                <Route path={RouteList.PROJECTS} component={ProjectsPage} />
                <Route path={RouteList.HOME} component={HomePage} />
            </Switch>
        </App>
    );
}
