import matchSorter from 'match-sorter';
import {
    Column,
    FilterValue,
    Hooks,
    IdType,
    Row,
    useFilters,
    useFlexLayout,
    useGlobalFilter,
    useResizeColumns,
    useRowSelect,
    useSortBy,
    useTable,
} from 'react-table';
import { ProjectData } from '../../types';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { DefaultColumnFilter, extraColumns } from './columns';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import { ProjectDataContext } from '../../containers/Root';
import { TableHead } from '../../common/TableHead';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import Brightness7Icon from '@material-ui/icons/Brightness7';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import TableRow from '@material-ui/core/TableRow';;
import TableCell from '@material-ui/core/TableCell';

function fuzzyTextFilterFn(
    rows: Row<ProjectData>[],
    id: IdType<any>,
    filterValue: FilterValue
) {
    return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

interface TableProps {
    columns: Array<Column<ProjectData>>;
}
export function Table({ columns }: TableProps) {
    const { toggleDarkMode, fetchLocalData, projects, darkMode } = useContext(
        ProjectDataContext
    );

    useEffect(() => {
        fetchLocalData();
    }, []);

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
                return rows.filter((row) => {
                    const rowValue = row.values[id];
                    return rowValue !== undefined
                        ? String(rowValue)
                              .toLowerCase()
                              .startsWith(String(filterValue).toLowerCase())
                        : true;
                });
            },
        }),
        []
    );

    const defaultColumn = useMemo(
        () => ({
            width: 150,
            minWidth: 150,
            Filter: DefaultColumnFilter,
            maxWidth: 400,
        }),
        []
    );
    const defaultSortBy = useMemo(
        () => [
            {
                id: 'size',
                desc: false,
            },
        ],
        []
    );
    // Use the state and functions returned from useTable to build your UI
    // @ts-ignore
    let {
        getTableProps,
        headerGroups,
        rows,
        preGlobalFilteredRows,
        setGlobalFilter,
        toggleAllRowsSelected,
        prepareRow,
        isAllRowsSelected,
        toggleRowSelected,
        selectedFlatRows,
        state: { selectedRowIds, globalFilter },
    } = useTable(
        {
            autoResetSelectedRows: false,
            autoResetSortBy: false,
            autoResetGlobalFilter: false,
            autoResetFilters: false,
            columns,
            filterTypes,
            initialState: {
                sortBy: defaultSortBy,
            },
            getRowId: React.useCallback((row) => row.path, []),
            defaultColumn,
            data: projects,
        },
        useFilters,
        useGlobalFilter,
        useFlexLayout,
        useSortBy,
        useResizeColumns,
        useRowSelect,
        (hooks: Hooks<ProjectData>) => extraColumns({ hooks })
    );

    // Render the UI for your table
    return (
        <>
            <TableHead headerGroups={headerGroups} title={'History'} subtitle={""}>
                <Tooltip title={'Toggle Light/Dark Theme'}>
                    <IconButton onClick={toggleDarkMode}>
                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Tooltip>
            </TableHead>
            {/*<Toolbar*/}
            {/*    preGlobalFilteredRows={preGlobalFilteredRows}*/}
            {/*    globalFilter={globalFilter}*/}
            {/*    setGlobalFilter={setGlobalFilter}*/}
            {/*    selectedFlatRows={selectedFlatRows}*/}
            {/*    selectedRowIds={selectedRowIds}*/}
            {/*    onDeleteSelected={onDeleteProjects}*/}
            {/*/>*/}
            <MaUTable component="div" {...getTableProps()}>
                <TableHead headerGroups={headerGroups} />
                <TableBody component="div">
                    {rows.map((row) => {
                        prepareRow(row);
                        const { original: project } = row;
                        return (
                            <TableRow
                                component="div"
                                onContextMenu={(e) => {
                                    e.preventDefault(0);
                                    // handleContextMenu(row.original);
                                }}
                                {...row.getRowProps()}
                                // classes={{
                                //     root:
                                //         project.status ===
                                //         ProjectStatus.Deleting
                                //             ? ''
                                //             : classes.rowRoot,
                                // }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    // handleRowClicked(row);
                                }}
                            >
                                {row.cells.map((cell) => {
                                    return (
                                        <TableCell
                                            component="div"
                                            {...cell.getCellProps()}
                                            classes={{ root: classes.cellRoot }}
                                        >
                                            {cell.render('Cell')}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                    {/*<Rows*/}
                    {/*    isAllRowsSelected={isAllRowsSelected}*/}
                    {/*    toggleAllRowsSelected={toggleAllRowsSelected}*/}
                    {/*    rows={rows}*/}
                    {/*    toggleRowSelected={toggleRowSelected}*/}
                    {/*    prepareRow={prepareRow}*/}
                    {/*/>*/}
                </TableBody>
            </MaUTable>
            {/*{!!projects.length && (*/}
            {/*    <Popups toggleAllRowsSelected={toggleAllRowsSelected} />*/}
            {/*)}*/}
        </>
    );
}
