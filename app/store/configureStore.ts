import configureStoreDev from './configureStore.dev';
import configureStoreProd from './configureStore.prod';

const selectedConfigureStore =
    process.env.NODE_ENV === 'production'
        ? configureStoreProd
        : configureStoreDev;

export const { createStore } = selectedConfigureStore;

export const { history } = selectedConfigureStore;
