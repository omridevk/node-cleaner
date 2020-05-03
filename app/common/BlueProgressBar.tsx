// Inspired by the Facebook spinners.
import makeStyles from '@material-ui/core/styles/makeStyles';
import { CircularProgressProps, createStyles, Theme } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';

const useStylesFacebook = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'relative'
        },
        top: {
            color: theme.palette.grey['200']
        },
        bottom: {
            color: theme.palette.primary.main,
            animationDuration: '550ms',
            position: 'absolute',
            left: 0
        }
    })
);

export function BlueProgress(props: CircularProgressProps) {
    const classes = useStylesFacebook();

    return (
        <div className={classes.root}>
            <CircularProgress
                variant="determinate"
                value={100}
                className={classes.top}
                size={24}
                thickness={4}
                {...props}
            />
            <CircularProgress
                variant="indeterminate"
                disableShrink
                className={classes.bottom}
                size={24}
                thickness={4}
                {...props}
            />
        </div>
    );
}
