import React, { useContext, useEffect, useState } from 'react';
import { Projects } from '../modules';
import Snackbar from '@material-ui/core/Snackbar';
import { ProjectData } from '../types';
import { ProjectDataContext } from './Root';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { ScanState } from '../hooks/useScan';
import { ProjectStatus } from '../types/Project';

const Alert = (props: AlertProps) => (
    <MuiAlert elevation={6} variant="filled" {...props} />
);

export default function ProjectPage() {
    const {
        projects = [],
        state,
        updateProjectsStatus,
        startScan,
        totalSizeString,
    } = useContext(ProjectDataContext);


    const { scanning, folders } = state;

    useEffect(() => {
        if (scanning === ScanState.Loading) {
            return;
        }
        startScan(folders);
    }, []);
    const [showSnackbar, setShowSnackbar] = useState(false);

    function onDeleteProjects(projects: ProjectData[]) {
        updateProjectsStatus({
            updatedProjects: projects,
            status: ProjectStatus.PendingDelete,
        });
    }
    const finished = scanning === ScanState.Finished;
    useEffect(() => {
        if (finished) {
            return;
        }
        setShowSnackbar(true);
    }, [state]);

    return (
        <>
            <Snackbar
                onClose={() => setShowSnackbar(false)}
                open={finished && showSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={4000}
            >
                <Alert severity="info">
                    Found {projects.length} Projects. Total size{' '}
                    {totalSizeString}
                </Alert>
            </Snackbar>
            <Projects onDeleteProjects={onDeleteProjects} />
        </>
    );
}
