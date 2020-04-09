import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';
import matchSorter from 'match-sorter';
import {
    Column,
    FilterValue,
    IdType,
    Row,
    useFilters,
    useFlexLayout,
    useGlobalFilter,
    useResizeColumns,
    useRowSelect,
    useSortBy,
    useTable
} from 'react-table';
import { ProjectData } from '../../types';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DefaultColumnFilter } from './columns';
import { IndeterminateCheckbox } from '../../common/IndeterminateCheckbox';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import DeleteIcon from '@material-ui/icons/Delete';
import { Toolbar } from './Toolbar';
import MaUTable from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableBody from '@material-ui/core/TableBody';
import { Rows } from './Rows';
import { ProjectDataContext } from '../../containers/Root';
import { useProjectsDeleted } from '../../hooks/useProjectsDeleted';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Typography from '@material-ui/core/Typography';
import { formatByBytes } from '../../utils/helpers';
import sum from 'ramda/src/sum';
import map from 'ramda/src/map';
import prop from 'ramda/src/prop';
import Container from '@material-ui/core/Container';
import { shell } from 'electron';
import { isDarwin } from '../../constants';
import Grid from '@material-ui/core/Grid';

// const animation = (reverseIt = false) => ({
//     opacity: reverseIt ? reverse([0.5, 1, 1, 0.5, 0.5]) : [0.5, 1, 1, 0.5, 0.5]
// });
// const transition = {
//     duration: 2,
//     ease: 'easeInOut',
//     times: [0, 0.2, 0.5, 0.8, 1],
//     loop: Infinity,
//     repeatDelay: 1
// };

const useStyles = makeStyles(() =>
    createStyles({
        rowRoot: {
            maxHeight: '80px'
        },
        cellRoot: {
            '&>div': {
                display: 'inline-block'
            },
            borderRight: 'solid 1px rgba(0, 0, 0, 0.12)',
            lineHeight: '2.5rem'
        },
        resizer: {
            display: 'inline-block',
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
            width: '5px',
            opacity: 0,
            height: '100%',
            position: 'absolute',
            right: 0,
            top: 0,
            transform: 'translateX(50%)',
            zIndex: 10
        },
        tableSortLabelRoot: {
            display: 'none'
        },
        resizing: {
            background: 'red'
        }
    })
);

function fuzzyTextFilterFn(
    rows: Row<ProjectData>[],
    id: IdType<any>,
    filterValue: FilterValue
) {
    return matchSorter(rows, filterValue, { keys: [row => row.values[id]] });
}

interface TableProps {
    columns: Array<Column<ProjectData>>;
    onDeleteRow: (project: ProjectData) => void;
    onDeleteSelected: (projects: ProjectData[]) => void;
}
export function Table({ columns, onDeleteRow, onDeleteSelected }: TableProps) {
    const classes = useStyles();
    const { projects = [], deletedProjects } = useContext(ProjectDataContext);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const filterTypes = React.useMemo(
        () => ({
            // Add a new fuzzyTextFilterFn filter type.
            fuzzyText: fuzzyTextFilterFn,
            // Or, override the default text filter to use
            // "startWith"
            text: (
                rows: Array<Row<ProjectData>>,
                id: IdType<string>,
                filterValue: FilterValue
            ) => {
                return rows.filter(row => {
                    const rowValue = row.values[id];
                    return rowValue !== undefined
                        ? String(rowValue)
                              .toLowerCase()
                              .startsWith(String(filterValue).toLowerCase())
                        : true;
                });
            }
        }),
        []
    );

    const defaultColumn = useMemo(
        () => ({
            width: 150,
            minWidth: 150,
            Filter: DefaultColumnFilter,
            maxWidth: 400
        }),
        []
    );
    const defaultSortBy = useMemo(
        () => [
            {
                id: 'size',
                desc: true
            }
        ],
        []
    );
    // Use the state and functions returned from useTable to build your UI
    // @ts-ignore
    const {
        getTableProps,
        headerGroups,
        rows,
        preGlobalFilteredRows,
        setGlobalFilter,
        toggleAllRowsSelected,
        prepareRow,
        selectedFlatRows,
        state: { selectedRowIds, globalFilter }
    } = useTable(
        {
            autoResetSelectedRows: false,
            autoResetSortBy: false,
            autoResetGlobalFilter: false,
            autoResetFilters: false,
            columns,
            filterTypes,
            initialState: {
                sortBy: defaultSortBy
            },
            defaultColumn,
            data: projects
        },
        useFilters,
        useGlobalFilter,
        useFlexLayout,
        useSortBy,
        useResizeColumns,
        useRowSelect,
        hooks => {
            hooks.visibleColumns.push(columns => [
                // Let's make a column for selection
                {
                    id: 'selection',
                    minWidth: '300px',
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
                    Header: () => 'Actions',
                    Cell: ({ row }) => (
                        <Container>
                            <Grid
                                container
                                wrap={'nowrap'}
                                direction="row"
                                justify="flex-end"
                            >
                                <Tooltip title="Delete" placement="top">
                                    <span>
                                        <IconButton
                                            aria-label="delete"
                                            onClick={() => {
                                                onDeleteRow(row.original);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip
                                    title={`Open in ${
                                        isDarwin ? 'finder' : 'file explorer'
                                    }`}
                                    placement="top"
                                >
                                    <span>
                                        <IconButton
                                            aria-label={``}
                                            onClick={() => {
                                                shell.openItem(
                                                    row.original.path
                                                );
                                            }}
                                        >
                                            <FolderOpenIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Grid>
                        </Container>
                    )
                }
            ]);
        }
    );
    const deletedTotalSize = useMemo(
        () => formatByBytes(sum(map(prop('size'), deletedProjects))),
        [deletedProjects]
    );
    // when we delete stuff, we want to reset all selected state.
    useEffect(() => {
        toggleAllRowsSelected(!deletedProjects.length);
        if (!deletedProjects.length) {
            return;
        }
        setShowSnackbar(true);
    }, [deletedProjects]);

    // Render the UI for your table
    return (
        <>
            <Snackbar
                onClose={() => setShowSnackbar(false)}
                open={showSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={4000}
            >
                <MuiAlert elevation={6} variant="filled" severity={'success'}>
                    Successfully deleted
                    {deletedProjects.length > 1 ? ' projects: ' : ' project: '}
                    <br />
                    <Typography
                        style={{ maxWidth: '200px' }}
                        noWrap
                        variant="subtitle2"
                    >
                        {deletedProjects
                            .map(project => project.name)
                            .join(', ')}
                    </Typography>
                    <Typography variant={'subtitle2'}>
                        Total spaced freed: {deletedTotalSize}
                    </Typography>
                </MuiAlert>
            </Snackbar>
            <Toolbar
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                selectedFlatRows={selectedFlatRows}
                selectedRowIds={selectedRowIds}
                onDeleteSelected={onDeleteSelected}
            />
            <MaUTable {...getTableProps()}>
                <TableHead>
                    {headerGroups.map(headerGroup => (
                        <TableRow
                            {...headerGroup.getHeaderGroupProps()}
                            classes={{
                                root: classes.rowRoot
                            }}
                        >
                            {headerGroup.headers.map((column: any) => (
                                <TableCell
                                    {...column.getHeaderProps(
                                        column.getSortByToggleProps()
                                    )}
                                    classes={{
                                        root: classes.cellRoot
                                    }}
                                >
                                    {column.render('Header')}
                                    <div>
                                        {column.canFilter
                                            ? column.render('Filter')
                                            : null}
                                    </div>
                                    {!column.disableResizing && (
                                        <div
                                            {...column.getResizerProps()}
                                            className={classes.resizer}
                                        />
                                    )}
                                    <TableSortLabel
                                        classes={{
                                            root: column.canSort
                                                ? ''
                                                : classes.tableSortLabelRoot
                                        }}
                                        active={column.isSorted}
                                        direction={
                                            column.isSortedDesc ? 'desc' : 'asc'
                                        }
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody>
                    <Rows rows={rows} prepareRow={prepareRow} />
                </TableBody>
            </MaUTable>
        </>
    );
}
