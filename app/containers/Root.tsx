import React, { useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider } from 'react-redux';
import { History } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import { ProjectData } from '../types';
import Routes from '../Routes';
// import { State, useIpc } from '../hooks/useIpc';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { Drive } from '../utils/list-drives';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import blue from '@material-ui/core/colors/blue';
import { noop } from '../utils/helpers';
import { useScan, State, ScanState, DeleteState } from '../hooks/useScan';
import { ContextMenu } from '../common/ContextMenu';

const defaultContext = {
    state: { scanning: ScanState.Idle, deleting: DeleteState.Idle },
    projects: [],
    darkMode: false,
    toggleDarkMode: noop,
    deletedProjects: [],
    startScan: (_: any) => {},
    pauseScan: noop,
    stopScan: noop,
    deleteProjects: noop,
    resumeScan: noop,
    currentFolder: '',
    drives: []
};

export const ProjectDataContext = React.createContext<{
    projects?: ProjectData[];
    state: State;
    toggleDarkMode: () => void;
    deletedProjects: ProjectData[];
    resetProjects?: () => void;
    deleteProjects: (projects: ProjectData[]) => void;
    darkMode: boolean;
    drives: Drive[];
    startScan: (dir: string | string[]) => void;
    pauseScan: () => void;
    stopScan: () => void;
    resumeScan: () => void;
    totalSizeString?: string;
    currentFolder?: string;
}>(defaultContext);

type Props = {
    store: any;
    history: History;
};

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark'
    }
});
const theme = createMuiTheme({
    palette: {
        primary: blue
    }
});

const Root = ({ store, history }: Props) => {
    const [darkMode, setDarkMode] = useState(defaultContext.darkMode);
    const {
        projects,
        resumeScan,
        pauseScan,
        stopScan,
        startScan,
        deleteProjects,
        resetProjects,
        deletedProjects,
        state,
        drives,
        totalSizeString
    } = useScan();
    return (
        <>
            <ThemeProvider theme={darkMode ? darkTheme : theme}>
                <CssBaseline />
                <ProjectDataContext.Provider
                    value={{
                        drives,
                        darkMode,
                        resumeScan,
                        startScan,
                        deleteProjects,
                        deletedProjects,
                        stopScan,
                        pauseScan,
                        toggleDarkMode: () =>
                            setDarkMode(prevState => !prevState),
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
            </ThemeProvider>
        </>
    );
};

export default hot(Root);
