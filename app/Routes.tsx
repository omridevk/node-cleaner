import React from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
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
import ScannerIcon from '@material-ui/icons/Scanner';
import makeStyles from '@material-ui/core/styles/makeStyles';
import HomeIcon from '@material-ui/icons/Home';
import HistoryIcon from '@material-ui/icons/History';
import { ProjectDataContext } from './containers/Root';
import { ScanState } from './hooks/useScan';
import Typography from '@material-ui/core/Typography';

export const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            width: '100vw',
            height: '100vh'
        },
        link: {
            '&.active': {
                color: theme.palette.primary.light,
                fontWeight: 'bold'
            },
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
        toolbar: {
            ...theme.mixins.toolbar,
            display: "flex",
            marginLeft: 70,
            alignItems: "center"
        },
        content: {
            flexGrow: 1
        }
    })
);

export default function Routes() {
    const classes = useStyles();
    const { state } = React.useContext(ProjectDataContext);
    let header = "";
    if (state.scanning === ScanState.Loading) {
        header = "Scanning";
    }
    if (state.scanning === ScanState.Finished) {
        header = "Finished";
    }
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
                <Typography variant='body1' className={classes.toolbar} >
                    {header}
                </Typography>
                <Divider />
                <List>
                    <NavLink
                        exact={true}
                        // activeClassName={classes.active}
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
                    </NavLink>
                    {state.scanning !== ScanState.Idle && (
                        <NavLink
                            // activeClassName={classes.active}
                            className={classes.link}
                            to={{
                                pathname: RouteList.PROJECTS
                            }}
                        >
                            <ListItem button>
                                <ListItemIcon>
                                    <ScannerIcon />
                                </ListItemIcon>
                                <ListItemText primary={'Scan'} />
                            </ListItem>
                        </NavLink>
                    )}

                    <NavLink
                        // activeClassName={classes.active}
                        className={classes.link}
                        to={{
                            pathname: RouteList.HISTORY
                        }}
                    >
                        <ListItem button>
                            <ListItemIcon>
                                <HistoryIcon />
                            </ListItemIcon>
                            <ListItemText primary={'History'} />
                        </ListItem>
                    </NavLink>
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
