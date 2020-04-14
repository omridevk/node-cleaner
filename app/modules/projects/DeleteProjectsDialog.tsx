import React, { useEffect, useMemo, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ProjectData } from '../../types';
import { head, isEmpty } from 'ramda';
import { useSnackbar, VariantType } from 'notistack';
import { formatByBytes } from '../../utils/helpers';
import { useCalculateSize } from '../../hooks/useCalculateSize';
import { Typography } from '@material-ui/core';

interface Props {
    projects: ProjectData[];
    handleAgree: (project: ProjectData) => void;
    handleModalClosed: () => void;
    agreeMessage?: string;
    agreeMessageVariant?: VariantType;
    visible?: boolean;
}

export default function DeleteProjectsDialog({
    projects,
    visible = false,
    agreeMessage = '',
    agreeMessageVariant = 'default',
    handleAgree,
    handleModalClosed
}: Props) {
    const [open, setOpen] = useState(visible);
    const { enqueueSnackbar } = useSnackbar();
    const totalSizeString = useCalculateSize(projects);
    useEffect(() => {
        setOpen(visible);
    }, [visible]);

    const handleClose = () => {
        setOpen(false);
        handleModalClosed();
    };

    const [project] = projects;
    if (!project) {
        return null;
    }
    const Title = ({ projects }: { projects: ProjectData[] }) => {
        if (projects.length > 1) {
            return <>Deleting Projects node_modules</>;
        }
        return (
            <span>
                Deleting project <b>{head(projects)!.name}</b> node_modules
            </span>
        );
    };
    const Message = ({ projects = [] }: { projects: ProjectData[] }) => {
        if (isEmpty(projects)) {
            return null;
        }
        const extraMessage = <Typography variant="subtitle1">Freed space: {totalSizeString}</Typography>;
        if (projects.length > 1) {
            return (
                <>
                    <DialogContentText variant="body1">
                        Are you sure want to delete these projects' node modules
                        folder? (this action cannot be undone)
                    </DialogContentText>
                    {extraMessage}
                </>
            );
        }
        return (
            <>
                <DialogContentText variant="body1">
                    Are you sure you want to delete
                    <b> {head(projects)?.name}</b> project's node_modules folder
                    (this action cannot be undone)?
                </DialogContentText>
                {extraMessage}
            </>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                <Title projects={projects} />
            </DialogTitle>
            <DialogContent>
                <Message projects={projects} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Disagree
                </Button>
                <Button
                    onClick={() => {
                        setOpen(false);
                        handleAgree(project);
                        if (!agreeMessage) {
                            return;
                        }
                        enqueueSnackbar(agreeMessage, {
                            variant: agreeMessageVariant
                        });
                    }}
                    color="primary"
                    autoFocus
                >
                    Agree
                </Button>
            </DialogActions>
        </Dialog>
    );
}
