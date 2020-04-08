import { IdType, Row } from 'react-table';
import { ProjectData } from '../../types';
import { formatByBytes, noop } from '../../utils/helpers';
import * as R from 'ramda';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import MaUToolbar from '@material-ui/core/Toolbar';
import clsx from 'clsx';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import React, { useContext, useMemo, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles, lighten, Theme } from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import { ProjectDataContext } from '../../containers/Root';
import { Messages } from '../../enums/messages';
import withStyles from '@material-ui/core/styles/withStyles';
import { State } from '../../hooks/useIpc';
import { MoreMenu } from '../../common/MoreMenu';
import { useHistory } from 'react-router';
import DeleteProjectsDialog from './DeleteProjectsDialog';

interface ToolbarProps {
    selectedRowIds: Record<IdType<ProjectData>, boolean>;
    selectedFlatRows: Array<Row<ProjectData>>;
    preGlobalFilteredRows: any;
    globalFilter: any;
    setGlobalFilter: any;
    searchText?: string;
    onDeleteSelected: (projects: ProjectData[]) => void;
}

const BorderLinearProgress = withStyles({
    root: {
        height: 8
    },
    bar: {
        borderRadius: 20
    }
})(LinearProgress);

const useToolbarStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            paddingLeft: theme.spacing(3.5),
            paddingRight: theme.spacing(10)
        },
        actionsContainer: {
            display: 'flex'
        },
        highlight:
            theme.palette.type === 'light'
                ? {
                      color: theme.palette.secondary.main,
                      backgroundColor: lighten(
                          theme.palette.secondary.light,
                          0.85
                      )
                  }
                : {
                      color: theme.palette.text.primary,
                      backgroundColor: theme.palette.secondary.dark
                  },
        title: {
            flex: '1 1 40%'
        }
    })
);

const SearchField = ({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter
}: any) => {
    const count = preGlobalFilteredRows.length;
    return (
        <TextField
            value={globalFilter || ''}
            onChange={event => setGlobalFilter(event.target.value || undefined)}
            placeholder={`Search ${count} projects`}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Tooltip title={'Search'}>
                            <SearchIcon color="inherit" fontSize="small" />
                        </Tooltip>
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            disabled={!globalFilter}
                            onClick={() => setGlobalFilter('')}
                        >
                            <ClearIcon color="inherit" fontSize="small" />
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    );
};

export const Toolbar = React.forwardRef(
    (
        {
            selectedFlatRows,
            selectedRowIds,
            preGlobalFilteredRows,
            globalFilter,
            setGlobalFilter,
            onDeleteSelected
        }: ToolbarProps,
        _
    ) => {
        const classes = useToolbarStyles();
        const history = useHistory();
        const [showDeleteModal, setShowDeleteModal] = useState(false);
        const {
            dispatch = noop,
            state,
            resetProjects,
            totalSizeString,
            projects = []
        } = useContext(ProjectDataContext);

        function cancelScan() {
            dispatch(Messages.CANCEL_SCAN);
            resetProjects!();
            history.push('/home');
        }

        const menuItems = useMemo(() => {
            const loading = state === State.loading;
            const finished = state === State.finished;
            return [
                {
                    title: loading ? 'Pause' : 'Resume',
                    action: () => {
                        dispatch(
                            loading ? Messages.PAUSE_SCAN : Messages.RESUME_SCAN
                        );
                    },
                    disabled: finished
                },
                {
                    title: 'Cancel',
                    action: () => cancelScan()
                },
                {
                    title: 'Delete All',
                    action: () => {
                        setShowDeleteModal(true);
                    }
                }
            ];
        }, [state]);
        const loading = state === State.loading;
        const numSelected = Object.keys(selectedRowIds).length;
        const totalSelectedSize = useMemo(() => {
            return formatByBytes(
                R.sum(selectedFlatRows.map(row => row.original.size as number))
            );
        }, [numSelected]);
        function handleDeleteSelected() {
            onDeleteSelected(selectedFlatRows.map(row => row.original));
        }
        const Header = ({ numSelected }: { numSelected: number }) => {
            if (!numSelected) {
                return null;
            }
            return (
                <Typography
                    className={classes.title}
                    color="inherit"
                    variant="subtitle1"
                >
                    {numSelected
                        ? `${numSelected} projects selected`
                        : 'Projects'}
                </Typography>
            );
        };

        return (
            <>
                <DeleteProjectsDialog
                    visible={showDeleteModal}
                    projects={projects}
                    handleAgree={() => {
                        setShowDeleteModal(false);
                        dispatch(Messages.DELETE_PROJECTS, projects);
                    }}
                    handleModalClosed={() => {
                        setShowDeleteModal(false);
                    }}
                />
                {loading && <BorderLinearProgress />}
                <MaUToolbar
                    className={clsx(classes.root, {
                        [classes.highlight]: numSelected > 0
                    })}
                >
                    <IconButton
                        aria-label="delete selected"
                        onClick={() => cancelScan()}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Header numSelected={numSelected} />
                    {/* TODO:: UNCOMMENT THIS AND FIND A NICE LAYOUT}
                    {/*<Typography*/}
                    {/*    className={classes.title}*/}
                    {/*    color="inherit"*/}
                    {/*    variant="subtitle1"*/}
                    {/*>*/}
                    {/*    scanning folder {currentFolder}*/}
                    {/*</Typography>*/}
                    <Typography
                        className={clsx(
                            classes.title,
                            classes.actionsContainer
                        )}
                        color="inherit"
                        variant="subtitle1"
                    >
                        {projects.length} Projects found , size:
                        {numSelected
                            ? `  ${totalSelectedSize}/${totalSizeString}`
                            : `  ${totalSizeString}`}
                    </Typography>
                    <SearchField
                        preGlobalFilteredRows={preGlobalFilteredRows}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                    />
                    <div className={classes.actionsContainer}>
                        {numSelected > 0 ? (
                            <Tooltip title="Delete Selected">
                                <IconButton
                                    aria-label="delete selected"
                                    onClick={handleDeleteSelected}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        ) : null}
                        <MoreMenu tooltip={'More Actions'} items={menuItems} />
                    </div>
                </MaUToolbar>
            </>
        );
    }
);
