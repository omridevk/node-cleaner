import React from 'react';
import { defaultColumns } from './columns';
import { ProjectData } from '../../types';
import { Table } from './Table';

const Projects: React.FC<{
    onDeleteProjects: (projects: ProjectData[]) => void;
}> = ({ onDeleteProjects }) => {
    return (
        <>
            <Table
                onDeleteSelected={onDeleteProjects}
                onDeleteRow={project => onDeleteProjects([project])}
                columns={defaultColumns()}
            />
        </>
    );
};

export default Projects;
