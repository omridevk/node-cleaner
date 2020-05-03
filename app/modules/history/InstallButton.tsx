import { ProjectData, ProjectStatus } from '../../types/Project';
import IconButton from '@material-ui/core/IconButton';
import { BlueProgress } from '../../common/BlueProgressBar';
import ReplayIcon from '@material-ui/icons/Replay';
import DoneIcon from '@material-ui/icons/Done';
import Tooltip from '@material-ui/core/Tooltip';
import React, { useMemo } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles, Theme } from '@material-ui/core';
import green from '@material-ui/core/colors/green';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        iconDone: {
            color: green['300']
        }
    })
);

interface Props {
    project: ProjectData;
    rowId: string;
    onInstall: (project: ProjectData, rowId: string) => void;
}

export const InstallButton: React.FC<Props> = ({
    project,
    onInstall,
    rowId
}) => {
    const classes = useStyles();
    const installed = useMemo(
        () => project.status === ProjectStatus.Installed,
        [project]
    );
    const installing = useMemo(
        () => project.status === ProjectStatus.Installing,
        [project]
    );
    const deleted = useMemo(() => project.status === ProjectStatus.Deleted, [
        project
    ]);
    return (
        <Tooltip title={installed ? 'Installed' : 'Install'} placement="top">
            <span>
                <IconButton
                    aria-label={installed ? 'Installed' : 'Install'}
                    disabled={installing}
                    onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (installed) {
                            return;
                        }
                        onInstall(project, rowId);
                    }}
                >
                    {installing && <BlueProgress />}
                    {deleted && <ReplayIcon />}
                    {installed && <DoneIcon className={classes.iconDone} />}
                </IconButton>
            </span>
        </Tooltip>
    );
};
