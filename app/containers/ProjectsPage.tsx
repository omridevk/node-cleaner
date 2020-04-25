import React, { useContext, useEffect, useState } from 'react';
import { Projects } from '../modules';
import Snackbar from '@material-ui/core/Snackbar';
import { ProjectData } from '../types';
import { ProjectDataContext } from './Root';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { useLocation } from 'react-router';
import { ScanState } from '../hooks/useScan';
import { ProjectStatus } from '../types/Project';
import { routes } from '../constants';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

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
    const location = useLocation<{ directories: string[], history: boolean}>();
    const { scanning } = state;

    const directories = location.state.directories;
    useEffect(() => {
        startScan(directories);
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
