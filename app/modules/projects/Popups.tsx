import React, { useContext, useEffect, useMemo, useState } from 'react';
import DeleteProjectsDialog from './DeleteProjectsDialog';
import { maximumSnackbars } from '../../constants';
import { ProjectDataContext } from '../../containers/Root';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Typography from '@material-ui/core/Typography';
import { formatByBytes } from '../../utils/helpers';
import sum from 'ramda/src/sum';
import map from 'ramda/src/map';
import prop from 'ramda/src/prop';
import { ProjectData, ProjectStatus } from '../../types/Project';
import { useSnackbar } from 'notistack';
import { differenceWith, eqBy, head, isEmpty } from 'ramda';

interface Props {
    toggleAllRowsSelected: (value?: boolean) => void;
}

const snackBarHideDuration = 4000;

export const Popups: React.FC<Props> = ({ toggleAllRowsSelected }) => {
    const {
        deleteProjects,
        projects = [],
        updateProjectsStatus,
        removeProjects
    } = useContext(ProjectDataContext);
    const [showModal, setShowModal] = useState(false);
    const [showedSnackbar, setShowedSnackbar] = useState<ProjectData[]>([]);
    const deleted = useMemo(
        () =>
            projects.filter(
                project => project.status === ProjectStatus.Deleted
            ),
        [projects]
    );
    const pending = useMemo(
        () =>
            projects.filter(
                project => project.status === ProjectStatus.PendingDelete
            ),
        [projects]
    );
    useEffect(() => {
        if (!pending.length) {
            return;
        }
        setShowSnackbar(true);
    }, [pending]);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const deletedTotalSize = useMemo(
        () => formatByBytes(sum(map(prop('size'), deleted))),
        [deleted]
    );
    useEffect(() => {
        if (isEmpty(pending)) {
            return;
        }
        setShowModal(true);
    }, [pending]);
    const { enqueueSnackbar } = useSnackbar();
    useEffect(() => {
        let timeoutId;
        if (!deleted.length) {
            return;
        }
        // timeoutId = setTimeout(() => {
        //     removeProjects(deleted);
        // }, snackBarHideDuration + 1000);
        if (deleted.length > maximumSnackbars) {
            return;
        }
        // TODO: fix issue here snack bar not show for more than 3!!
        const show = differenceWith(eqBy(prop('path')), showedSnackbar, deleted);
        show.forEach(project =>
            enqueueSnackbar(
                `successfully deleted ${
                    project.name
                } (freed space: ${formatByBytes(project.size)})`,
                {
                    variant: 'success'
                }
            )
        );
        setShowedSnackbar(deleted);
        return () => clearTimeout(timeoutId);
    }, [deleted, showedSnackbar]);

    const message =
        deleted.length > 1
            ? `Successfully deleted ${deleted.length} projects`
            : 'Successfully deleted projects: ';
    return (
        <>
            <Snackbar
                onClose={() => {
                    setShowSnackbar(false);
                }}
                open={showSnackbar && deleted.length > maximumSnackbars}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={snackBarHideDuration}
            >
                <MuiAlert elevation={6} variant="filled" severity={'success'}>
                    <Typography
                        style={{ maxWidth: '200px' }}
                        noWrap
                        variant="subtitle2"
                    >
                        {message}
                    </Typography>
                    <Typography variant={'subtitle2'}>
                        Total space freed: {deletedTotalSize}
                    </Typography>
                </MuiAlert>
            </Snackbar>
            <DeleteProjectsDialog
                handleModalClosed={() => {
                    setShowModal(false);
                    updateProjectsStatus({
                        updatedProjects: pending,
                        status: ProjectStatus.Active
                    });
                }}
                visible={showModal}
                agreeMessage={
                    pending.length > 1
                        ? 'Deleting projects...'
                        : `Deleting project ${head(pending)?.name}`
                }
                agreeMessageVariant={'info'}
                projects={pending}
                handleAgree={() => {
                    toggleAllRowsSelected(false);
                    setShowModal(false);
                    if (!pending) {
                        return;
                    }
                    deleteProjects(pending!);
                }}
            />
        </>
    );
};
