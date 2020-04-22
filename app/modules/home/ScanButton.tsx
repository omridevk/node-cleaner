import { Routes } from '../../constants';
import { createStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { isEmpty } from 'ramda';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import IconButton from '@material-ui/core/IconButton';
import withStyles from '@material-ui/core/styles/withStyles';
import CloseIcon from '@material-ui/icons/Close';
import red from '@material-ui/core/colors/red';
import { ScanType } from './ScanSelection';

const useStyles = makeStyles(() =>
    createStyles({
        extendedFab: {
            width: '100%',
            height: '0',
            padding: '50% 0',
            overflow: 'hidden',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            color: 'white',
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
            // boxShadow: '0 0 3px gray',
            // background:
            //     'linear-gradient(to right, rgb(255, 216, 155), rgb(25, 84, 123))',
            border: 'solid 2px #efefef',
        },
        fabText: {
            textAlign: 'center',
            lineHeight: '0.5rem',
        },
        roundButton: {
            minWidth: '100%',
        },
        link: {
            minWidth: '25%',
            textDecoration: 'none',
        },
        container: {
            margin: '15px',
            minWidth: '200px',
        },
    })
);

interface Props {
    directories: string[];
    disabled: boolean;
    scanType: ScanType;
}

const styles = (theme) => ({
    root: {
        margin: 0,
        backgroundColor: red.A100,
        color: theme.palette.common.white,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.common.white,
    },
});

const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton
                    aria-label="close"
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

export const ScanButton = ({
    directories,
    disabled = false,
    scanType,
}: Props) => {
    const classes = useStyles();
    const [error, setError] = useState(false);

    function handleClick(event) {
        if (!isEmpty(directories)) {
            return;
        }
        setError(true);
        event.preventDefault();
    }

    return (
        <div className={classes.container}>
            <Link
                onClick={handleClick}
                aria-disabled={disabled ? 'true' : 'false'}
                to={{
                    pathname: Routes.PROJECTS,
                    state: {
                        directories,
                    },
                }}
                className={classes.link}
            >
                <Button disabled={disabled} className={classes.extendedFab}>
                    <Typography className={classes.fabText} variant="h4">
                        Scan
                    </Typography>
                </Button>
            </Link>
            <Dialog open={error}>
                <DialogTitle onClose={() => setError(false)}>Error</DialogTitle>
                <DialogContent dividers={true}>
                    <DialogContentText variant="body1">
                        Please select at least one{' '}
                        {scanType === ScanType.Folder ? 'folder' : 'drive'}
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </div>
    );
};
