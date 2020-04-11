import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';
import matchSorter from 'match-sorter';
import {
    Column,
    FilterValue,
    HeaderGroup,
    Hooks,
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
import { DefaultColumnFilter, extraColumns } from './columns';
import { Toolbar } from './Toolbar';
import MaUTable from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableBody from '@material-ui/core/TableBody';
import { Rows } from './Rows';
import { ProjectDataContext } from '../../containers/Root';
import { ContextMenuState } from '../../types/ContextMenuState';
import { Popups } from './Popups';

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
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
        project: null,
        mouseX: null,
        mouseY: null
    });
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
        toggleRowSelected,
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
        (hooks: Hooks<ProjectData>) => extraColumns({ hooks, onDeleteRow })
    );
    // when we delete stuff, we want to reset all selected state.
    useEffect(() => {
        toggleAllRowsSelected(!deletedProjects.length);
        if (!deletedProjects.length) {
            return;
        }
    }, [deletedProjects]);

    // Render the UI for your table
    return (
        <>
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
                    {headerGroups.map(
                        (headerGroup: HeaderGroup<ProjectData>) => (
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
                                                column.isSortedDesc
                                                    ? 'desc'
                                                    : 'asc'
                                            }
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        )
                    )}
                </TableHead>
                <TableBody>
                    <Rows
                        handleContextMenuOpen={setContextMenuState}
                        rows={rows}
                        toggleRowSelected={toggleRowSelected}
                        prepareRow={prepareRow}
                    />
                </TableBody>
            </MaUTable>
            <Popups contextMenuState={contextMenuState} />
        </>
    );
}
