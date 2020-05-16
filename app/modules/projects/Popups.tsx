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
import { differenceWith, eqBy, head, isEmpty, uniq, uniqWith } from 'ramda';

interface Props {
    toggleAllRowsSelected: (value?: boolean) => void;
}

const snackBarHideDuration = 4000;

export const Popups: React.FC<Props> = ({ toggleAllRowsSelected }) => {
    const {
        deleteProjects,
        projects = [],
        updateProjectsStatus,
    } = useContext(ProjectDataContext);
    const [showModal, setShowModal] = useState(false);
    const [showedProjects, setShowedProjects] = useState<ProjectData[]>([]);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const deleted = useMemo(
        () =>
            projects.filter(
                (project) => project.status === ProjectStatus.Deleted
            ),
        [projects]
    );
    const pending = useMemo(
        () =>
            projects.filter(
                (project) => project.status === ProjectStatus.PendingDelete
            ),
        [projects]
    );
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
    const toShow = useMemo(() => {
        return differenceWith(eqBy(prop('path')), deleted, showedProjects);
    }, [deleted]);
    useEffect(() => {
        setShowedProjects((projects) => uniqWith(eqBy(prop('path')), [...projects, ...toShow]));
        if (toShow.length > maximumSnackbars) {
            setShowSnackbar(true);
            return;
        }
        toShow.forEach((project) => {
            enqueueSnackbar(
                `successfully deleted ${
                    project.name
                } (freed space: ${formatByBytes(project.size)})`,
                {
                    variant: 'success',
                }
            );
        });
    }, [toShow]);

    const message =
        toShow.length > 1
            ? `Successfully deleted ${toShow.length} projects`
            : 'Successfully deleted projects: ';
    return (
        <>
            <Snackbar
                onClose={() => {
                    setShowSnackbar(false);
                }}
                open={showSnackbar}
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
                        status: ProjectStatus.Active,
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
                    updateProjectsStatus({
                        updatedProjects: pending,
                        status: ProjectStatus.Deleted,
                    });
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
