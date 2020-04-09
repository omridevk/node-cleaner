import React, { useContext } from 'react';
import { Home } from '../modules';
import { ProjectDataContext } from './Root';

export default function HomePage() {
    const { drives } = useContext(ProjectDataContext);

    return <Home drives={drives} />;
}
