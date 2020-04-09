import React, { useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider } from 'react-redux';
import { History } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import { ProjectData } from '../types';
import Routes from '../Routes';
import { State, useIpc } from '../hooks/useIpc';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { Drive } from '../utils/list-drives';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import blue from '@material-ui/core/colors/blue';
import { noop } from '../utils/helpers';

const defaultContext = {
    state: State.idle,
    projects: [],
    darkMode: false,
    toggleDarkMode: noop,
    currentFolder: '',
    drives: []
};

export const ProjectDataContext = React.createContext<{
    projects?: ProjectData[];
    state: State;
    toggleDarkMode: () => void;
    resetProjects?: () => void;
    darkMode: boolean;
    drives: Drive[];
    totalSizeString?: string;
    currentFolder?: string;
    dispatch?: (channel: string, ...args: any[]) => void;
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
        dispatch,
        resetProjects,
        state,
        drives,
        totalSizeString,
        currentFolder
    } = useIpc();
    return (
        <>
            <ThemeProvider theme={darkMode ? darkTheme : theme}>
                <CssBaseline />
                <ProjectDataContext.Provider
                    value={{
                        drives,
                        darkMode,
                        toggleDarkMode: () =>
                            setDarkMode(prevState => !prevState),
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
            </ThemeProvider>
        </>
    );
};

export default hot(Root);
