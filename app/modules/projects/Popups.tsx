import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ContextMenu } from '../../common/ContextMenu';
import DeleteProjectsDialog from './DeleteProjectsDialog';
import { ContextMenuState } from '../../types/ContextMenuState';
import { isDarwin } from '../../constants';
import { shell } from 'electron';
import { ProjectData } from '../../types';
import { ProjectDataContext } from '../../containers/Root';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Typography from '@material-ui/core/Typography';
import { formatByBytes } from '../../utils/helpers';
import sum from 'ramda/src/sum';
import map from 'ramda/src/map';
import prop from 'ramda/src/prop';

interface Props {
    contextMenuState: ContextMenuState;
}

export const Popups: React.FC<Props> = ({ contextMenuState }) => {
    const { deleteProjects, deletedProjects } = useContext(ProjectDataContext);
    useEffect(() => {
        if (!deletedProjects.length) {
            return;
        }
        setShowSnackbar(true);
    }, [deletedProjects]);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const deletedTotalSize = useMemo(
        () => formatByBytes(sum(map(prop('size'), deletedProjects))),
        [deletedProjects]
    );
    const [deletedProject, setDeletedProject] = useState<ProjectData | null>();

    function handleDeleteProject() {
        const { project } = contextMenuState;
        if (project === null) {
            return;
        }
        setDeletedProject(project);
    }
    function handleOpenPath() {
        const { project } = contextMenuState;
        if (!project?.path) {
            return;
        }
        shell.openItem(project?.path);
    }

    const contextMenuItems = useMemo(() => {
        return [
            {
                text: 'Delete',
                action: handleDeleteProject
            },
            {
                text: `Open in ${isDarwin ? 'finder' : 'file explorer'}`,
                action: handleOpenPath
            }
        ];
    }, [contextMenuState]);

    return (
        <>
            <Snackbar
                onClose={() => setShowSnackbar(false)}
                open={showSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={4000}
            >
                <MuiAlert elevation={6} variant="filled" severity={'success'}>
                    Successfully deleted
                    {deletedProjects.length > 1 ? ' projects: ' : ' project: '}
                    <br />
                    <Typography
                        style={{ maxWidth: '200px' }}
                        noWrap
                        variant="subtitle2"
                    >
                        {deletedProjects
                            .map(project => project.name)
                            .join(', ')}
                    </Typography>
                    <Typography variant={'subtitle2'}>
                        Total spaced freed: {deletedTotalSize}
                    </Typography>
                </MuiAlert>
            </Snackbar>
            <ContextMenu
                items={contextMenuItems}
                mouseX={contextMenuState.mouseX}
                mouseY={contextMenuState.mouseY}
                project={contextMenuState.project}
            />
            <DeleteProjectsDialog
                handleModalClosed={() => {
                    setDeletedProject(null);
                }}
                visible={!!deletedProject}
                projects={deletedProject ? [deletedProject] : []}
                handleAgree={() => {
                    setDeletedProject(null);
                    deleteProjects([deletedProject!]);
                }}
            />
        </>
    );
};
