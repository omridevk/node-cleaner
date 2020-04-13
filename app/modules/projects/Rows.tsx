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
                event: React.MouseEvent<any>,
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
            };

            const classes = useStyles();
            if (!rows.length) {
                return (
                    <tr>
                        <td>
                            <Alert severity={'warning'}>No Results found</Alert>
                        </td>
                    </tr>
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
