import React from 'react';
import { FilterValue, Hooks, IdType, Row } from 'react-table';
import { ProjectData } from '../../types';
import { formatByBytes } from '../../utils/helpers';
import moment from 'moment';
import Tooltip from '@material-ui/core/Tooltip';
import { CircularProgressProps, createStyles, Theme } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { IndeterminateCheckbox } from '../../common/IndeterminateCheckbox';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import ReplayIcon from '@material-ui/icons/Replay';
import { isDarwin } from '../../constants';
import { shell } from 'electron';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ProjectStatus } from '../../types/Project';
import { SliderColumnFilter } from '../../common/SliderFilter';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DoneIcon from '@material-ui/icons/Done';
import { BlueProgress } from '../../common/BlueProgressBar';
import { InstallButton } from './InstallButton';

// Define a custom filter filter function!
function filterGreaterThan(
    rows: Array<Row<ProjectData>>,
    id: IdType<any>,
    filterValue: FilterValue
) {
    return rows.filter(row => {
        const rowValue = row.values[id];
        return rowValue >= filterValue;
    });
}

const useStyles = makeStyles(() =>
    createStyles({
        cellText: {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
        },
        iconDone: {}
    })
);

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val: any) => typeof val !== 'number';

// Define a default UI for filtering
export const DefaultColumnFilter = () => {
    return null;
};

export const defaultColumns = [
    {
        Header: 'Name',
        accessor: 'name',
        defaultCanFilter: true,
        Cell: ({ row }: { row: Row<ProjectData> }) => {
            const {
                original: { name }
            } = row;
            const classes = useStyles();
            return (
                <Tooltip
                    title={name || ''}
                    aria-label={name || ''}
                    placement="top"
                >
                    <div className={classes.cellText}>{name}</div>
                </Tooltip>
            );
        }
    },
    {
        Header: 'Original size',
        accessor: 'size',
        sortInverted: true,
        Filter: SliderColumnFilter,
        filter: filterGreaterThan,
        Cell: ({ row }: { row: Row<ProjectData> }) => (
            <div>{formatByBytes(row.original.size)}</div>
        ),
        disableResizing: true
    },
    {
        Header: 'Last modified',
        accessor: 'lastModified',
        defaultCanFilter: false,
        sortType: 'datetime',
        Cell: ({ row }: { row: Row<ProjectData> }) => (
            <div>{moment(row.original.lastModified).fromNow()}</div>
        ),
        disableResizing: true
    },
    {
        Header: 'Description',
        accessor: 'description',
        Cell: ({ row }: { row: Row<ProjectData> }) => {
            const {
                original: { description }
            } = row;
            const classes = useStyles();
            return (
                <Tooltip
                    title={description || ''}
                    aria-label={description || ''}
                    placement="top"
                >
                    <div className={classes.cellText}>{description}</div>
                </Tooltip>
            );
        }
    },
    {
        Header: 'Full Path',
        accessor: 'path',
        Cell: ({ row }: { row: Row<ProjectData> }) => {
            const {
                original: { path }
            } = row;
            const classes = useStyles();
            return (
                <Tooltip title={path} aria-label={path} placement="top">
                    <div className={classes.cellText}>{path}</div>
                </Tooltip>
            );
        }
    }
];

export const extraColumns = ({
    hooks,
    onInstall
}: {
    hooks: Hooks<ProjectData>;
    onInstall: (project: ProjectData, rowId: string) => void;
}) => {
    {
        hooks.visibleColumns.push(columns => [
            // Let's make a column for selection
            {
                id: 'selection',
                width: 75,
                maxWidth: 75,
                minWidth: 30,
                disableResizing: true,
                // The header can use the table's getToggleAllRowsSelectedProps method
                // to render a checkbox
                Header: ({ getToggleAllRowsSelectedProps }) => (
                    <IndeterminateCheckbox
                        {...getToggleAllRowsSelectedProps()}
                    />
                ),
                // The cell can use the individual row's getToggleRowSelectedProps method
                // to the render a checkbox
                Cell: ({ row }: { row: Row<ProjectData> }) => (
                    <div>
                        <IndeterminateCheckbox
                            {...row.getToggleRowSelectedProps()}
                        />
                    </div>
                )
            },
            ...columns,
            {
                id: 'actions',
                disableResizing: true,
                minWidth: 200,
                Header: () => 'Actions',
                Cell: ({ row }) => (
                    <Container>
                        <Grid
                            container
                            wrap={'nowrap'}
                            direction="row"
                            justify="flex-end"
                        >
                            <InstallButton
                                project={row.original}
                                rowId={row.id}
                                onInstall={onInstall}
                            />
                            <Tooltip
                                title={`Open in ${
                                    isDarwin ? 'finder' : 'file explorer'
                                }`}
                                placement="top"
                            >
                                <span>
                                    <IconButton
                                        aria-label={``}
                                        onClick={event => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            shell.openItem(row.original.path);
                                        }}
                                    >
                                        <FolderOpenIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip
                                title={row.isExpanded ? 'Minimize' : 'Expand'}
                                placement="top"
                            >
                                <span>
                                    <IconButton
                                        aria-label={
                                            row.isExpanded
                                                ? 'Minimize'
                                                : 'Expand'
                                        }
                                        disabled={
                                            row.original.status ===
                                            ProjectStatus.Deleted
                                        }
                                        onClick={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            row.toggleRowExpanded();
                                        }}
                                    >
                                        {row.isExpanded ? (
                                            <ExpandMoreIcon />
                                        ) : (
                                            <ExpandLessIcon />
                                        )}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                    </Container>
                )
            }
        ]);
    }
};
