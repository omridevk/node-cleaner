import React, { useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider } from 'react-redux';
import { History } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import { ProjectData } from '../types';
import Routes from '../Routes';
import {
    CssBaseline,
    ThemeProvider
} from '@material-ui/core';
import { Drive } from '../utils/list-drives';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import blue from '@material-ui/core/colors/blue';
import { formatByBytes, noop } from '../utils/helpers';
import { useScan, State, ScanState, DeleteState } from '../hooks/useScan';
import { SnackbarProvider } from 'notistack';
import { maximumSnackbars } from '../constants';
import checkDiskSpace from 'check-disk-space';

const defaultContext = {
    state: { scanning: ScanState.Idle, deleting: DeleteState.Idle },
    projects: [],
    darkMode: false,
    toggleDarkMode: noop,
    foldersScanned: 0,
    deletedProjects: [],
    resetScan: noop,
    startScan: (_: any) => {
    },
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
    foldersScanned: number;
    toggleDarkMode: () => void;
    deletedProjects: ProjectData[];
    resetScan: () => void;
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
        resetScan,
        deleteProjects,
        foldersScanned,
        deletedProjects,
        state,
        drives,
        totalSizeString
    } = useScan();
    useEffect(() => {
        checkDiskSpace('/').then(({ free, size }) => console.log({
            free: formatByBytes(free),
            size: formatByBytes(size)
        }));
    }, []);

    return (
        <>
            <ThemeProvider theme={darkMode ? darkTheme : theme}>
                <SnackbarProvider maxSnack={maximumSnackbars}>
                    <>
                        <CssBaseline/>
                        <ProjectDataContext.Provider
                            value={{
                                drives,
                                resetScan,
                                foldersScanned,
                                darkMode,
                                resumeScan,
                                startScan,
                                deleteProjects,
                                deletedProjects,
                                stopScan,
                                pauseScan,
                                toggleDarkMode: () =>
                                    setDarkMode(prevState => !prevState),
                                projects,
                                state,
                                totalSizeString
                            }}
                        >
                            <Provider store={store}>
                                <ConnectedRouter history={history}>
                                    <Routes/>
                                </ConnectedRouter>
                            </Provider>
                        </ProjectDataContext.Provider>
                    </>
                </SnackbarProvider>
            </ThemeProvider>
        </>
    );
};

export default hot(Root);
