import React, { useContext } from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';
import { IdType, Row } from 'react-table';
import { ProjectData } from '../../types';
import Alert from '@material-ui/lab/Alert';
import { ProjectStatus } from '../../types/Project';
import { clipboard, remote, shell } from 'electron';
import { ProjectDataContext } from '../../containers/Root';

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

interface RowsProps {
    rows: Array<Row<ProjectData>>;
    toggleRowSelected: (rowId: IdType<ProjectData>, set?: boolean) => void;
    prepareRow: (row: Row<ProjectData>) => void;
    isAllRowsSelected: boolean;
    toggleAllRowsSelected: (value?: boolean) => void;
}
const { Menu } = remote;

interface CreateContextMenuProps {
    project: ProjectData;
    toggleAllRowsSelected: (value?: boolean) => void;
    isAllRowsSelected: boolean;
    updateProjectsStatus: ({
        updatedProjects,
        status
    }: {
        updatedProjects: ProjectData[];
        status: ProjectStatus;
    }) => void;
}

const createContextMenu = ({
    project,
    updateProjectsStatus,
    isAllRowsSelected,
    toggleAllRowsSelected
}: CreateContextMenuProps) => {
    const template = [
        {
            label: 'Open',
            click() {
                shell.openItem(project.path);
            }
        },
        {
            label: 'Copy project path to clipboard',
            click() {
                clipboard.writeText(project.path);
            }
        },
        {
            label: isAllRowsSelected ? `Deselect All` : `Select All`,
            click() {
                toggleAllRowsSelected();
            }
        },
        {
            label: `Delete`,
            click() {
                // todo delete project
                updateProjectsStatus({
                    updatedProjects: [project],
                    status: ProjectStatus.PendingDelete
                });
            },
            enabled: project.status !== ProjectStatus.Deleting
        }
    ];
    return Menu.buildFromTemplate(template);
};

// @ts-ignore
export const Rows: React.ForwardRefExoticComponent<RowsProps> = React.forwardRef(
    (
        {
            rows,
            prepareRow,
            toggleRowSelected,
            toggleAllRowsSelected,
            isAllRowsSelected
        },
        _
    ) => {
        const { updateProjectsStatus } = useContext(ProjectDataContext);
        {
            const handleContextMenu = (project: ProjectData) => {
                const menu = createContextMenu({
                    project,
                    isAllRowsSelected,
                    updateProjectsStatus,
                    toggleAllRowsSelected
                });
                menu.popup({ window: remote.getCurrentWindow() });
            };

            const classes = useStyles();
            if (!rows.length) {
                return (
                    <div>
                        <div>
                            <Alert severity={'warning'}>No Results found</Alert>
                        </div>
                    </div>
                );
            }
            function handleRowClicked(row: Row<ProjectData>) {
                const { original: project } = row;
                if (project.status === ProjectStatus.Deleting) {
                    return;
                }
                toggleRowSelected(row.id);
            }

            return rows.map(row => {
                prepareRow(row);
                const { original: project } = row;
                return (
                    <TableRow
                        component="div"
                        onContextMenu={(e) => {
                            e.preventDefault(0);
                            handleContextMenu(row.original)
                        }}
                        {...row.getRowProps()}
                        classes={{
                            root:
                                project.status === ProjectStatus.Deleting
                                    ? ''
                                    : classes.rowRoot
                        }}
                        onClick={e => {
                            e.preventDefault();
                            handleRowClicked(row);
                        }}
                    >
                        {row.cells.map(cell => {
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
            });
        }
    }
);
