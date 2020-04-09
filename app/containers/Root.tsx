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
import { useIpcV2 } from '../hooks/useIpcV2';

const defaultContext = {
    state: State.idle,
    projects: [],
    currentFolder: '',
    startScan: (_: any) => {},
    drives: []
};
export interface ProjectContext {
    projects?: ProjectData[];
    state: State;
    resetProjects?: () => void;
    startScan: (dir: string | string[]) => void;
    pauseScan: () => void;
    stopScan: () => void;
    resumeScan: () => void;
    drives: Drive[];
    totalSizeString?: string;
    currentFolder: string;
    // dispatch?: (channel: string, ...args: any[]) => void;
}

export const ProjectDataContext = React.createContext<ProjectContext>(
    defaultContext
);

type Props = {
    store: any;
    history: History;
};

const Root = ({ store, history }: Props) => {
    const {
        projects,
        startScan,
        stopScan,
        drives,
        resumeScan,
        resetProjects,
        totalSizeString,
        pauseScan,
        state
    } = useIpcV2();
    // const {
    //     // projects,
    //     // dispatch,
    //
    //     currentFolder
    // } = useIpc();
    return (
        <>
            <CssBaseline />
            <ProjectDataContext.Provider
                value={{
                    startScan,
                    stopScan,
                    resumeScan,
                    pauseScan,
                    drives,
                    // currentFolder,
                    resetProjects,
                    projects,
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
