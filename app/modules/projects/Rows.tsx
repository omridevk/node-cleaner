import React from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';
import { IdType, Row } from 'react-table';
import { ProjectData } from '../../types';
import Alert from '@material-ui/lab/Alert';
import { ProjectStatus } from '../../types/Project';

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
    handleContextMenuOpen: (data: {
        project: ProjectData;
        mouseX: null | number;
        mouseY: null | number;
    }) => void;
}

// @ts-ignore
export const Rows: React.ForwardRefExoticComponent<RowsProps> = React.forwardRef(
    ({ rows, prepareRow, toggleRowSelected, handleContextMenuOpen }, _) => {
        {
            const handleContextMenu = (
                event: React.MouseEvent<HTMLDivElement>,
                row: Row<ProjectData>
            ) => {
                const { original: project } = row;
                if (project.status === ProjectStatus.Deleting) {
                    return;
                }
                event.preventDefault();
                handleContextMenuOpen({
                    mouseX: event.clientX - 2,
                    mouseY: event.clientY - 4,
                    project
                });
                // clear selection when opening
                // context menu
                const selection = window.getSelection();
                if (selection === null) {
                    return;
                }
                selection.empty();
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
                        onContextMenu={event => handleContextMenu(event, row)}
                        {...row.getRowProps()}
                        classes={{
                            root:
                                project.status === ProjectStatus.Deleting
                                    ? ''
                                    : classes.rowRoot
                        }}
                        onClick={() => handleRowClicked(row)}
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
