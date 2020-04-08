import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ProjectData } from '../../types';

interface Props {
    projects: ProjectData[];
    handleAgree: (project: ProjectData) => void;
    handleModalClosed: () => void;
    visible?: boolean;
}

export default function DeleteProjectsDialog({
    projects,
    visible = false,
    handleAgree,
    handleModalClosed
}: Props) {
    const [open, setOpen] = React.useState(visible);
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
    const title =
        projects.length > 1
            ? 'Deleting Projects'
            : `Deleting project ${project.name}`;
    const message =
        projects.length > 1
            ? 'Are you sure want to delete these projects? (this action cannot be undone)'
            : `Are you sure you want to delete ${project.name} (this
                        action cannot be undone) ?`;

    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Disagree
                    </Button>
                    <Button
                        onClick={() => {
                            setOpen(false);
                            handleAgree(project);
                        }}
                        color="primary"
                        autoFocus
                    >
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
