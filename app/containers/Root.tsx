import React, { useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider } from 'react-redux';
import { History } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import { ProjectData } from '../types';
import Routes from '../Routes';
import {
    createStyles,
    CssBaseline,
    Theme,
    ThemeProvider
} from '@material-ui/core';
import { Drive } from '../utils/list-drives';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import blue from '@material-ui/core/colors/blue';
import { noop } from '../utils/helpers';
import { useScan, State, ScanState, DeleteState } from '../hooks/useScan';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import makeStyles from '@material-ui/core/styles/makeStyles';

const defaultContext = {
    state: { scanning: ScanState.Idle, deleting: DeleteState.Idle },
    projects: [],
    darkMode: false,
    toggleDarkMode: noop,
    foldersScanned: 0,
    deletedProjects: [],
    resetScan: noop,
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
    foldersScanned: number;
    toggleDarkMode: () => void;
    deletedProjects: ProjectData[];
    resetProjects?: () => void;
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

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        backdrop: {
            zIndex: theme.zIndex.drawer + 1
        }
    })
);

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
        resetProjects,
        foldersScanned,
        deletedProjects,
        state,
        drives,
        totalSizeString
    } = useScan();

    const { deleting } = state;
    const isDeleting = deleting === DeleteState.Deleting;
    const classes = useStyles();
    return (
        <>
            <ThemeProvider theme={darkMode ? darkTheme : theme}>
                <CssBaseline />
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
                        resetProjects,
                        projects,
                        state,
                        totalSizeString
                    }}
                >
                    <Provider store={store}>
                        <ConnectedRouter history={history}>
                            <Backdrop
                                open={isDeleting}
                                classes={{ root: classes.backdrop }}
                            >
                                <CircularProgress color="inherit" />
                            </Backdrop>
                            <Routes />
                        </ConnectedRouter>
                    </Provider>
                </ProjectDataContext.Provider>
            </ThemeProvider>
        </>
    );
};

export default hot(Root);
