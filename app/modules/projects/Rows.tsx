import React from 'react';
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
}

// @ts-ignore
export const Rows = React.forwardRef(
    ({ rows, prepareRow, toggleRowSelected }: RowsProps, _) => {
        {
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
