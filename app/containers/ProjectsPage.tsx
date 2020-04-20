import React, { useContext, useEffect, useState } from 'react';
import { Projects } from '../modules';
import Snackbar from '@material-ui/core/Snackbar';
import { ProjectData } from '../types';
import { ProjectDataContext } from './Root';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { useLocation } from 'react-router';
import { ScanState } from '../hooks/useScan';
import { ProjectStatus } from '../types/Project';

const Alert = (props: AlertProps) => (
    <MuiAlert elevation={6} variant="filled" {...props} />
);

export default function ProjectPage() {
    const {
        projects = [],
        state,
        // deleteProjects,
        updateProjectsStatus,
        startScan,
        totalSizeString
    } = useContext(ProjectDataContext);
    const location = useLocation<{ directories: string[] }>();
    const { scanning } = state;

    let directories = location.state.directories;
    useEffect(() => {
        startScan(directories);
    }, []);
    // directory = directory!.toString();
    const [deleted, setDeleted] = useState<ProjectData[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);

    function onDeleteProjects(projects: ProjectData[]) {
        console.log({projects});
        updateProjectsStatus({updatedProjects: projects, status: ProjectStatus.PendingDelete});
        // setDeleted(projects);
        // setShowDialog(true);
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
            {/* Delete Single project
            TODO: find a way to have one delete project dialog modal
            */}
            {/*<DeleteProjectsDialog*/}
            {/*    handleModalClosed={() => {*/}
            {/*        setShowDialog(false);*/}
            {/*    }}*/}
            {/*    agreeMessage={*/}
            {/*        deleted.length > 1*/}
            {/*            ? 'Deleting projects...'*/}
            {/*            : `Deleting project ${head(deleted)?.name}`*/}
            {/*    }*/}
            {/*    agreeMessageVariant={'info'}*/}
            {/*    visible={showDialog}*/}
            {/*    projects={deleted}*/}
            {/*    handleAgree={() => {*/}
            {/*        setShowDialog(false);*/}
            {/*        deleteProjects(deleted);*/}
            {/*    }}*/}
            {/*/>*/}
            <Projects onDeleteProjects={onDeleteProjects} />
        </>
    );
}
