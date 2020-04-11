import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles, Theme } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import { useSpring, animated } from 'react-spring';
import withStyles from '@material-ui/core/styles/withStyles';
import LinearProgress from '@material-ui/core/LinearProgress';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import RefreshIcon from '@material-ui/icons/Refresh';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Tooltip from '@material-ui/core/Tooltip';
import { ScanState } from '../../hooks/useScan';
import { ProjectData } from '../../types';

interface Props {
    title: string;
    state?: ScanState;
    resetScan: () => void;
    projects: ProjectData[];
    toggleScanState: () => void;
    foldersScanned: number;
    onDeleteAll: () => void;
    onCancelScan: () => void;
    toggleDarkMode: () => void;
    darkMode: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBarRoot: {
            opacity: 0.85,
            backgroundColor:
                theme.palette.type === 'light'
                    ? 'rgba(227, 227, 227, 0.85)'
                    : '#303030',
            color: theme.palette.text.primary
        },
        root: {
            flexGrow: 1
        },
        title: {
            flexGrow: 1
        },
        offset: theme.mixins.toolbar
    })
);

const BorderLinearProgress = withStyles({
    root: {
        height: 8
    },
    bar: {
        borderRadius: 20
    }
})(LinearProgress);

export const Header: React.FC<Props> = ({
    title,
    state = ScanState.Idle,
    projects,
    onCancelScan,
    foldersScanned,
    onDeleteAll,
    resetScan,
    toggleScanState,
    toggleDarkMode,
    darkMode
}) => {
    const classes = useStyles();
    const loading = state === ScanState.Loading;
    const finished = state === ScanState.Finished;
    const props = useSpring({ foldersScanned });
    return (
        <>
            <AppBar
                classes={{ root: classes.appBarRoot }}
                position="fixed"
                variant="elevation"
            >
                <Toolbar>
                    <Tooltip title={'Back'}>
                        <IconButton
                            edge="start"
                            aria-label="delete selected"
                            onClick={onCancelScan}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                    <Typography variant="h6" className={classes.title}>
                        {loading ? 'Scanning...' : title}
                    </Typography>
                    <Typography variant="subtitle2" className={classes.title}>
                        Scanned {finished ? ' total of ' : ''}
                        <animated.span>
                            {props.foldersScanned.interpolate(x =>
                                parseInt(x).toLocaleString()
                            )}
                        </animated.span>{' '}
                        folders {finished ? '' : ' so far...'}
                    </Typography>
                    {!finished && (
                        <Tooltip title={loading ? 'Pause' : 'Resume'}>
                            <IconButton onClick={toggleScanState}>
                                {loading ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title={'Rescan'}>
                        <IconButton onClick={resetScan}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={'Delete All'}>
                        <span>
                            <IconButton
                                disabled={!projects.length}
                                aria-label="delete selected"
                                onClick={onDeleteAll}
                            >
                                <DeleteForeverIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title={'Toggle Light/Dark Theme'}>
                        <IconButton onClick={toggleDarkMode}>
                            {darkMode ? (
                                <Brightness7Icon />
                            ) : (
                                <Brightness4Icon />
                            )}
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <Toolbar />
            {loading && <BorderLinearProgress />}
        </>
    );
};
