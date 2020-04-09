import React, { useContext, useEffect, useState } from 'react';
import { Projects } from '../modules';
import Snackbar from '@material-ui/core/Snackbar';
import { State } from '../hooks/useIpc';
import DeleteProjectsDialog from '../modules/projects/DeleteProjectsDialog';
import { Messages } from '../enums/messages';
import { ProjectData } from '../types';
import { noop } from '../utils/helpers';
import { ProjectDataContext } from './Root';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { useLocation } from 'react-router';

const Alert = (props: AlertProps) => (
    <MuiAlert elevation={6} variant="filled" {...props} />
);

export default function ProjectPage() {
    const { projects = [], state, startScan, totalSizeString} = useContext(
        ProjectDataContext
    );
    const location = useLocation<{ directories: string[] }>();
    const directories = location.state.directories;
    useEffect(() => {
        startScan(directories);
        // dispatch(Messages.START_SCANNING, directories);
    }, []);
    // directory = directory!.toString();
    const [deleted, setDeleted] = useState<ProjectData[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);

    function onDeleteProjects(projects: ProjectData[]) {
        setDeleted(projects);
        setShowDialog(true);
    }

    useEffect(() => {
        if (state !== State.finished) {
            return;
        }
        setShowSnackbar(true);
    }, [state]);

    return (
        <>
            <Snackbar
                onClose={() => setShowSnackbar(false)}
                open={state === State.finished && showSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={4000}
            >
                <Alert severity="success">
                    Found {projects.length} Projects. Total size{' '}
                    {totalSizeString}
                </Alert>
            </Snackbar>
            <DeleteProjectsDialog
                handleModalClosed={() => {
                    setShowDialog(false);
                }}
                visible={showDialog}
                projects={deleted}
                handleAgree={() => {
                    setShowDialog(false);
                    // dispatch(Messages.DELETE_PROJECTS, deleted);
                }}
            />
            <Projects onDeleteProjects={onDeleteProjects} />
        </>
    );
}
