import React, { useContext } from 'react';
import { Home } from '../modules';
import { ProjectDataContext } from './Root';

export default function HomePage() {
    const { state } = useContext(ProjectDataContext);
    const { drives } = state;
    return <Home drives={drives} />;
}
