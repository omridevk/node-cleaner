import { useEffect, useState } from 'react';
import { ipcRenderer } from "electron";
import { Messages } from '../enums/messages';
import { ProjectData } from '../types';

export const useProjectsDeleted = () => {
    const [deletedProjects, setDeletedProjects] = useState<ProjectData[]>([]);
    useEffect(() => {
        function handleDeleted(_, projects: ProjectData[]) {
            setDeletedProjects(projects);
        }
        ipcRenderer.on(Messages.PROJECTS_DELETED, handleDeleted);
        return () => {
            ipcRenderer.off(Messages.PROJECTS_DELETED, handleDeleted);
        };
    }, []);
    return {deletedProjects};
};
