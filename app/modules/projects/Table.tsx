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
    useRowState
} from 'react-table';
import { ProjectData } from '../../types';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DefaultColumnFilter, extraColumns } from './columns';
import { Toolbar } from './Toolbar';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import { Rows } from './Rows';
import { ProjectDataContext } from '../../containers/Root';
import { ContextMenuState } from '../../types/ContextMenuState';
import { Popups } from './Popups';
import { TableHead } from './TableHead';

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
                toggleAllRowsSelected={toggleAllRowsSelected}
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                selectedFlatRows={selectedFlatRows}
                selectedRowIds={selectedRowIds}
                onDeleteSelected={onDeleteSelected}
            />
            <MaUTable component="div" {...getTableProps()}>
                <TableHead headerGroups={headerGroups} />
                <TableBody component="div">
                    <Rows
                        handleContextMenuOpen={setContextMenuState}
                        rows={rows}
                        toggleRowSelected={toggleRowSelected}
                        prepareRow={prepareRow}
                    />
                </TableBody>
            </MaUTable>
            <Popups
                toggleAllRowsSelected={toggleAllRowsSelected}
                contextMenuState={contextMenuState}
            />
        </>
    );
}
