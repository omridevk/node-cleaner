import React from 'react';
import projectColumns from './columns';
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
                columns={projectColumns()}
            />
        </>
    );
};

export default Projects;
