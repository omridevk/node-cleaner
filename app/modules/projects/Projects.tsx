import React, { useCallback, useContext } from 'react';
import { defaultColumns } from './columns';
import { ProjectData } from '../../types';
import { Table } from './Table';
import { Header } from './Header';
import { ProjectDataContext } from '../../containers/Root';
import { ScanState } from '../../hooks/useScan';
import { useHistory } from 'react-router';

const Projects: React.FC<{
    onDeleteProjects: (projects: ProjectData[]) => void;
}> = ({ onDeleteProjects }) => {
    const {
        state: { scanning },
        darkMode,
        stopScan,
        pauseScan,
        resumeScan,
        foldersScanned,
        resetScan,
        projects,
        toggleDarkMode
    } = useContext(ProjectDataContext);
    const loading = scanning === ScanState.Loading;
    const history = useHistory();
    function cancelScan() {
        stopScan();
        history.push('/home');
    }
    function deleteAll() {
        if (!projects?.length) {
            return;
        }
        onDeleteProjects(projects);
    }
    const toggleScan = useCallback(() => {
        if (loading) {
            pauseScan();
            return;
        }
        resumeScan();
    }, [loading, pauseScan, resetScan]);

    return (
        <>
            <Header
                foldersScanned={foldersScanned}
                resetScan={resetScan}
                onDeleteAll={deleteAll}
                projects={projects!}
                toggleScanState={toggleScan}
                onCancelScan={cancelScan}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                title={'Node Cleaner'}
                state={scanning}
            />
            <Table
                onDeleteSelected={onDeleteProjects}
                onDeleteRow={project => onDeleteProjects([project])}
                columns={defaultColumns()}
            />
        </>
    );
};

export default Projects;
