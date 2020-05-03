import matchSorter from 'match-sorter';
import {
    Column,
    FilterValue,
    Hooks,
    IdType,
    Row,
    useExpanded,
    useFilters,
    useFlexLayout,
    useGlobalFilter,
    useResizeColumns,
    useRowSelect,
    useSortBy,
    useTable
} from 'react-table';
import { ProjectData } from '../../types';
import React, { useContext, useEffect, useMemo } from 'react';
import { DefaultColumnFilter, extraColumns } from './columns';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import { ProjectDataContext } from '../../containers/Root';
import { TableHead } from '../../common/TableHead';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { Toolbar } from './Toolbar';
import { Alert } from '@material-ui/lab';
import { PageBar } from '../../common/PageBar';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';
import { ProjectStatus } from '../../types/Project';
import { Lines } from './Lines';
import { useInstall } from '../../hooks/useInstall';

const useStyles = makeStyles(() =>
    createStyles({
        rowRoot: {
            cursor: 'pointer'
        },
        cellRoot: {
            lineHeight: '2.5rem'
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

interface Project extends ProjectData {
    output: string[];
}

type Actions = 'update_data';
interface Action<T = any> {
    type: Actions;
    payload?: T;
}

interface TableProps {
    columns: Array<Column<ProjectData>>;
}
export function Table({ columns }: TableProps) {
    const {
        toggleDarkMode,
        fetchLocalData,
        projects,
        darkMode,
        updateProjectsStatus
    } = useContext(ProjectDataContext);
    const classes = useStyles();
    const { installData, install } = useInstall();
    const projectsPath = useMemo(() => {
        return projects.map((project: ProjectData) => [project.path, []]);
    }, [projects]);
    useEffect(() => {
        fetchLocalData();
    }, []);
    function onInstall(project: ProjectData, rowId: string) {
        toggleRowExpanded(rowId, true);
        updateProjectsStatus({
            updatedProjects: [project],
            status: ProjectStatus.Installing
        });
        install(project);
    }

    useEffect(() => {
        installData.forEach((data, id) => {
            if (!data.done) {
                return;
            }
            const project = projects!.find(project => project.id === id);
            updateProjectsStatus({
                updatedProjects: [project],
                status: ProjectStatus.Installed
            });
        });
    }, [installData]);

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
        toggleRowExpanded,
        toggleRowSelected,
        selectedFlatRows,
        state: { selectedRowIds, globalFilter }
    } = useTable(
        {
            autoResetSelectedRows: false,
            autoResetSortBy: false,
            autoResetExpanded: false,
            autoResetGlobalFilter: false,
            autoResetFilters: false,
            columns,
            filterTypes,
            initialState: {
                sortBy: defaultSortBy
            },
            getRowId: React.useCallback(row => row.path, []),
            defaultColumn,
            data: projects
        },
        useFilters,
        useGlobalFilter,
        useFlexLayout,
        useSortBy,
        useResizeColumns,
        useRowSelect,
        useExpanded,
        (hooks: Hooks<ProjectData>) => extraColumns({ hooks, onInstall })
    );

    // Render the UI for your table
    return (
        <>
            <PageBar title={'History'} subtitle={''}>
                <Tooltip title={'Toggle Light/Dark Theme'}>
                    <IconButton onClick={toggleDarkMode}>
                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Tooltip>
            </PageBar>
            <Toolbar
                preGlobalFilteredRows={preGlobalFilteredRows}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                selectedFlatRows={selectedFlatRows}
                selectedRowIds={selectedRowIds}
            />
            <MaUTable component="div" {...getTableProps()}>
                <TableHead headerGroups={headerGroups} />
                <TableBody component="div">
                    {!rows.length && (
                        <div>
                            <div>
                                <Alert severity={'warning'}>
                                    No Results found
                                </Alert>
                            </div>
                        </div>
                    )}
                    {rows.map(row => {
                        prepareRow(row);
                        const { original: project } = row;
                        const { key } = row.getRowProps();
                        const data = installData.get(project.id);
                        return (
                            <React.Fragment key={key}>
                                <TableRow
                                    component="div"
                                    onContextMenu={e => {
                                        e.preventDefault(0);
                                    }}
                                    {...row.getRowProps()}
                                    onClick={e => {
                                        e.preventDefault();
                                        toggleRowSelected(row.id);
                                    }}
                                >
                                    {row.cells.map(cell => {
                                        return (
                                            <TableCell
                                                component="div"
                                                {...cell.getCellProps()}
                                                classes={{
                                                    root: classes.cellRoot
                                                }}
                                            >
                                                {cell.render('Cell')}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                                {row.isExpanded && data?.lines && (
                                    <Lines
                                        lines={data.lines}
                                        done={data?.done}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </MaUTable>
        </>
    );
}
