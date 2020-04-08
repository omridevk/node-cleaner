import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider } from 'react-redux';
import { History } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import { ProjectData } from '../types';
import Routes from '../Routes';
import { State, useIpc } from '../hooks/useIpc';
import { CssBaseline } from '@material-ui/core';
import { Drive } from '../utils/list-drives';

const defaultContext = {
    state: State.idle,
    projects: [],
    currentFolder: '',
    drives: []
};

export const ProjectDataContext = React.createContext<{
    projects?: ProjectData[];
    state: State;
    resetProjects?: () => void;
    drives: Drive[];
    totalSizeString?: string;
    currentFolder: string;
    dispatch?: (channel: string, ...args: any[]) => void;
}>(defaultContext);

type Props = {
    store: any;
    history: History;
};

const Root = ({ store, history }: Props) => {
    const {
        projects,
        dispatch,
        resetProjects,
        state,
        drives,
        totalSizeString,
        currentFolder
    } = useIpc();
    return (
        <>
            <CssBaseline />
            <ProjectDataContext.Provider
                value={{
                    drives,
                    currentFolder,
                    resetProjects,
                    projects,
                    dispatch,
                    state,
                    totalSizeString
                }}
            >
                <Provider store={store}>
                    <ConnectedRouter history={history}>
                        <Routes />
                    </ConnectedRouter>
                </Provider>
            </ProjectDataContext.Provider>
        </>
    );
};

export default hot(Root);
