import React, { useCallback, useContext, useMemo } from 'react';
import { ProjectData } from '../../types';
import { Table } from './Table';
import { Header } from './Header';
import { ProjectDataContext } from '../../containers/Root';
import { ScanState } from '../../hooks/useScan';
import { useHistory } from 'react-router';
import { defaultColumns } from './columns';

const Projects: React.FC<{
    onDeleteProjects: (projects: ProjectData[]) => void;
}> = ({ onDeleteProjects }) => {
    const columns = useMemo(() => defaultColumns, []);

    return (
        <>
            <Table
                onDeleteProjects={onDeleteProjects}
                onDeleteRow={project => onDeleteProjects([project])}
                columns={columns}
            />
        </>
    );
};

export default Projects;
