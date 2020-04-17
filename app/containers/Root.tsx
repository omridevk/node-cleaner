import React, { useEffect, useState } from 'react';
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
import { maximumSnackbars } from '../constants';
import { ipcRenderer } from 'electron';
import { Messages } from '../enums/messages';

const defaultContext = {
    state: { scanning: ScanState.Idle, deleting: DeleteState.Idle },
    projects: [],
    darkMode: false,
    toggleDarkMode: noop,
    foldersScanned: 0,
    deletedProjects: [],
    resetScan: noop,
    startScan: (_: any) => {},
    totalSpace: { free: '', size: '' },
    pauseScan: noop,
    stopScan: noop,
    deleteProjects: noop,
    resumeScan: noop,
    currentFolder: '',
    drives: [],
};

export const ProjectDataContext = React.createContext<{
    projects?: ProjectData[];
    state: State;
    foldersScanned: number;
    totalSpace: { free: string; size: string };
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
    useDarkMode?: boolean;
};

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
});
const theme = createMuiTheme({
    palette: {
        primary: blue,
    },
});

const Root = ({ store, history, useDarkMode = false}: Props) => {
    const [darkMode, setDarkMode] = useState(useDarkMode);
    useEffect(() => {
        function onChangeTheme(_, darkMode: boolean) {
            setDarkMode(darkMode);
        }
        ipcRenderer.on(Messages.CHANGE_THEME, onChangeTheme);
        return () => {
            ipcRenderer.off(Messages.CHANGE_THEME, onChangeTheme)
        }
    }, []);
    const {
        projects,
        resumeScan,
        pauseScan,
        stopScan,
        startScan,
        totalSpace,
        resetScan,
        deleteProjects,
        foldersScanned,
        deletedProjects,
        state,
        drives,
        totalSizeString,
    } = useScan();

    return (
        <>
            <ThemeProvider theme={darkMode ? darkTheme : theme}>
                <SnackbarProvider maxSnack={maximumSnackbars}>
                    <>
                        <CssBaseline />
                        <ProjectDataContext.Provider
                            value={{
                                drives,
                                totalSpace,
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
                                    setDarkMode((prevState) => !prevState),
                                projects,
                                state,
                                totalSizeString,
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
