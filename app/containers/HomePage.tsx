import React, { useContext, useEffect } from 'react';
import { Home } from '../modules';
import { ProjectDataContext } from './Root';
import { noop } from '../utils/helpers';
import { Messages } from '../enums/messages';

export default function HomePage() {
    const { dispatch = noop, drives} = useContext(ProjectDataContext);

    useEffect(() => {
        dispatch(Messages.START_SCAN_DRIVES);
    }, []);

    return <Home drives={drives} />;
}
