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
    useTable
} from 'react-table';
import { ProjectData } from '../../types';
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import { DefaultColumnFilter, extraColumns } from './columns';
import { Toolbar } from './Toolbar';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import { Rows } from './Rows';
import { ProjectDataContext } from '../../containers/Root';
import { ContextMenuState } from '../../types/ContextMenuState';
import { Popups } from './Popups';
import { TableHead } from './TableHead';
import { Header } from './Header';
import { ScanState } from '../../hooks/useScan';
import { useHistory } from 'react-router';
import { ProjectStatus } from '../../types/Project';

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
    onDeleteProjects: (projects: ProjectData[]) => void;
}
export function Table({ columns, onDeleteRow, onDeleteProjects }: TableProps) {
    const {
        projects = [],
        foldersScanned,
        stopScan,
        state: { scanning },
        toggleDarkMode,
        pauseScan,
        resetScan,
        resumeScan,
        darkMode
    } = useContext(ProjectDataContext);

    const activeProjects = useMemo(
        () =>
            projects.filter(
                project => project.status !== ProjectStatus.Deleted
            ),
        [projects]
    );
    const deletedProjects = useMemo(
        () =>
            projects.filter(
                project => project.status === ProjectStatus.Deleted
            ),
        [projects]
    );
    const loading = scanning === ScanState.Loading;
    const history = useHistory();

    function cancelScan() {
        stopScan();
        history.push('/home');
    }
    function deleteAll() {
        if (!activeProjects?.length) {
            return;
        }
        onDeleteProjects(activeProjects);
    }

    const toggleScan = useCallback(() => {
        if (loading) {
            pauseScan();
            return;
        }
        resumeScan();
    }, [loading, pauseScan, resetScan]);
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
                desc: false
            }
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
            getRowId: React.useCallback(row => row.path, []),
            defaultColumn,
            data: activeProjects
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
        if (!deletedProjects.length) {
            return;
        }
        toggleAllRowsSelected(!deletedProjects.length);
    }, [deletedProjects]);

    const onResetScan = useCallback(() => {
        toggleAllRowsSelected(false);
        resetScan();
    }, [resetScan, toggleAllRowsSelected]);

    // Render the UI for your table
    return (
        <>
            <Header
                foldersScanned={foldersScanned}
                resetScan={onResetScan}
                onDeleteAll={deleteAll}
                projects={activeProjects!}
                toggleScanState={toggleScan}
                onCancelScan={cancelScan}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                title={'Node Cleaner'}
                state={scanning}
            />
            <Toolbar
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                selectedFlatRows={selectedFlatRows}
                selectedRowIds={selectedRowIds}
                onDeleteSelected={onDeleteProjects}
            />
            <MaUTable component="div" {...getTableProps()}>
                <TableHead headerGroups={headerGroups} />
                <TableBody component="div">
                    <Rows
                        isAllRowsSelected={isAllRowsSelected}
                        toggleAllRowsSelected={toggleAllRowsSelected}
                        rows={rows}
                        toggleRowSelected={toggleRowSelected}
                        prepareRow={prepareRow}
                    />
                </TableBody>
            </MaUTable>
            <Popups toggleAllRowsSelected={toggleAllRowsSelected} />
        </>
    );
}
