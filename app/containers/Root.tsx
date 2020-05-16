import React, { useEffect, useMemo, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider } from 'react-redux';
import { History } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import { ProjectData } from '../types';
import Routes from '../Routes';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { Drive } from '../utils/list-drives';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import blue from '@material-ui/core/colors/blue';
import { noop } from '../utils/helpers';
import { useScan, State, ScanState, DeleteState } from '../hooks/useScan';
import { SnackbarProvider } from 'notistack';
import { electronStoreName, maximumSnackbars } from '../constants';
import { ipcRenderer } from 'electron';
import { Messages } from '../enums/messages';
import { ProjectStatus } from '../types/Project';
import { Finder } from '../utils/finder';
import ElectronStore from 'electron-store';

interface ProjectContext {
    projects?: ProjectData[];
    state: State;
    foldersScanned: number;
    totalSpace: { free: string; size: string };
    toggleDarkMode: () => void;
    updateProjectsStatus: ({
        updatedProjects,
        status
    }: {
        updatedProjects: ProjectData[];
        status: ProjectStatus;
    }) => void;
    resetScan: () => void;
    cleanedProjects: ProjectData[];
    deleteProjects: (projects: ProjectData[]) => void;
    darkMode: boolean;
    setFolders: (folders: string[]) => void;
    setDrives: (drives: Drive[]) => void;
    fetchLocalData: () => void;
    startScan: (dir: string | string[]) => void;
    pauseScan: () => void;
    stopScan: () => void;
    resumeScan: () => void;
    totalSizeString?: string;
    currentFolder?: string;
}

const defaultContext: ProjectContext = {
    state: {
        scanning: ScanState.Idle,
        deleting: DeleteState.Idle,
        drives: [],
        folders: []
    },
    projects: [],
    cleanedProjects: [],
    darkMode: false,
    toggleDarkMode: noop,
    foldersScanned: 0,
    fetchLocalData: noop,
    resetScan: noop,
    setDrives: noop,
    setFolders: noop,
    updateProjectsStatus: noop,
    startScan: (_: any) => {},
    totalSpace: { free: '', size: '' },
    pauseScan: noop,
    stopScan: noop,
    deleteProjects: noop,
    resumeScan: noop,
    currentFolder: ''
};

export const ProjectDataContext = React.createContext<ProjectContext>(
    defaultContext
);

type Props = {
    store: any;
    history: History;
    useDarkMode?: boolean;
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

const Root = ({ store, history, useDarkMode = false }: Props) => {
    const [darkMode, setDarkMode] = useState(useDarkMode);

    const finder = useMemo(() => {
        return new Finder();
    }, []);
    const electronStore = useMemo(() => {
        return new ElectronStore({ name: electronStoreName });
    }, []);

    useEffect(() => {
        function onChangeTheme(_, darkMode: boolean) {
            setDarkMode(darkMode);
        }
        ipcRenderer.on(Messages.CHANGE_THEME, onChangeTheme);
        return () => {
            ipcRenderer.off(Messages.CHANGE_THEME, onChangeTheme);
        };
    }, []);
    const {
        projects,
        resumeScan,
        pauseScan,
        stopScan,
        startScan,
        fetchLocalData,
        totalSpace,
        setFolders,
        setDrives,
        cleanedProjects,
        resetScan,
        deleteProjects,
        foldersScanned,
        updateProjectsStatus,
        state,
        totalSizeString
    } = useScan(finder, electronStore);

    return (
        <>
            <ThemeProvider theme={darkMode ? darkTheme : theme}>
                <SnackbarProvider maxSnack={maximumSnackbars}>
                    <>
                        <CssBaseline />
                        <ProjectDataContext.Provider
                            value={{
                                setFolders,
                                setDrives,
                                totalSpace,
                                resetScan,
                                fetchLocalData,
                                cleanedProjects,
                                foldersScanned,
                                darkMode,
                                resumeScan,
                                updateProjectsStatus,
                                startScan,
                                deleteProjects,
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
                                    <Routes />
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
