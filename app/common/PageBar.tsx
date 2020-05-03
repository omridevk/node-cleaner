import React, { ReactElement } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles, Theme } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import withStyles from '@material-ui/core/styles/withStyles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Link } from 'react-router-dom';
import { Routes } from '../constants';
import Button from '@material-ui/core/Button';

interface Props {
    title: string;
    subtitle: string | ReactElement<any>;
    loading?: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBarRoot: {
            opacity: 0.85,
            backgroundColor:
                theme.palette.type === 'light'
                    ? 'rgba(227, 227, 227, 0.85)'
                    : '#303030',
            color: theme.palette.text.primary,
        },
        root: {
            flexGrow: 1,
        },
        title: {
            flexGrow: 1,
        },
        offset: theme.mixins.toolbar,
    })
);

const BorderLinearProgress = withStyles({
    root: {
        height: 8,
    },
    bar: {
        borderRadius: 20,
    },
})(LinearProgress);

export const PageBar: React.FC<Props> = ({ children, title, subtitle, loading }) => {
    const classes = useStyles();
    return (
        <>
            <AppBar
                classes={{ root: classes.appBarRoot }}
                position="fixed"
                variant="elevation"
            >
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        {title}
                    </Typography>
                    <Typography variant="subtitle2" className={classes.title}>
                        {subtitle}
                    </Typography>
                    {children}
                </Toolbar>
            </AppBar>
            <Toolbar />
            {loading && <BorderLinearProgress />}
        </>
    );
};
