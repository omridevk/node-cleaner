import React from 'react';
import { Switch, Route, Link, useLocation } from 'react-router-dom';
import { Routes as RouteList } from './constants';
import App from './containers/App';
import HomePage from './containers/HomePage';
import ProjectsPage from './containers/ProjectsPage';
import { HistoryPage } from './containers/HistoryPage';
import { createStyles, Theme } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Drawer from '@material-ui/core/Drawer';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import makeStyles from '@material-ui/core/styles/makeStyles';
import HomeIcon from '@material-ui/icons/Home';
import HistoryIcon from '@material-ui/icons/History';

export const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            width: "100vw",
            height: "100vh"
        },
        link: {
            color: 'inherit',
            textDecoration: 'none'
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0
        },
        drawerPaper: {
            width: drawerWidth
        },
        // necessary for content to be below app bar
        toolbar: theme.mixins.toolbar,
        content: {
            flexGrow: 1
        }
    })
);

export default function Routes() {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{
                    paper: classes.drawerPaper
                }}
                anchor="left"
            >
                <div className={classes.toolbar} />
                <Divider />
                <List>
                    <Link
                        className={classes.link}
                        to={{
                            pathname: RouteList.HOME
                        }}
                    >
                        <ListItem button>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary={'Home'} />
                        </ListItem>
                    </Link>
                    <Link
                        className={classes.link}
                        to={{
                            pathname: RouteList.HISTORY
                        }}
                    >
                        <Divider />
                        <ListItem button>
                            <ListItemIcon>
                                <HistoryIcon />
                            </ListItemIcon>
                            <ListItemText primary={'History'} />
                        </ListItem>
                    </Link>
                </List>
            </Drawer>
            <App className={classes.content}>
                <Switch>
                    <Route path={RouteList.HISTORY} component={HistoryPage} />
                    <Route path={RouteList.PROJECTS} component={ProjectsPage} />
                    <Route path={RouteList.HOME} component={HomePage} />
                </Switch>
            </App>
        </div>
    );
}
