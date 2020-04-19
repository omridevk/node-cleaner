import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';
import { ipcRenderer } from 'electron';
import { Messages } from './enums/messages';
import { remote } from 'electron';
const { Menu, MenuItem } = remote;

const store = configureStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

ipcRenderer.once(Messages.CHANGE_THEME, (_, darkMode) => {


    render(
        <AppContainer>
            <Root store={store} history={history} useDarkMode={darkMode} />
        </AppContainer>,
        document.getElementById('root')
    );
});
