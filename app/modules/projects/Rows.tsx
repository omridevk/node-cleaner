import React, { useCallback, useContext, useMemo } from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';
import { IdType, Row } from 'react-table';
import { ProjectData } from '../../types';
import Alert from '@material-ui/lab/Alert';

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
export const Rows = React.forwardRef(
    (
        {
            rows,
            prepareRow,
            toggleRowSelected,
            handleContextMenuOpen
        }: RowsProps,
        _
    ) => {
        {
            const handleClick = (
                event: React.MouseEvent<any>,
                row: Row<ProjectData>
            ) => {
                event.preventDefault();
                handleContextMenuOpen({
                    mouseX: event.clientX - 2,
                    mouseY: event.clientY - 4,
                    project: row.original
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

            return rows.map(row => {
                prepareRow(row);
                return (
                    <TableRow
                        onContextMenu={event => handleClick(event, row)}
                        {...row.getRowProps()}
                        classes={{ root: classes.rowRoot }}
                        onClick={() => toggleRowSelected(row.id)}
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
