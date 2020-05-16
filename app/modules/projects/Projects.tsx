import React, { useMemo } from 'react';
import { ProjectData } from '../../types';
import { Table } from './Table';
import { defaultColumns } from './columns';

const Projects: React.FC<{
    onDeleteProjects: (projects: ProjectData[]) => void;
}> = ({ onDeleteProjects }) => {
    const columns = useMemo(() => defaultColumns, []);

    return (
        <>
            <Table
                onDeleteProjects={onDeleteProjects}
                onDeleteRow={(project) => onDeleteProjects([project])}
                columns={columns}
            />
        </>
    );
};

export default Projects;
