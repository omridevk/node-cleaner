import React from 'react';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';
import { Row } from 'react-table';
import { ProjectData } from '../../types';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles(() =>
    createStyles({
        cellRoot: {
            lineHeight: '2.5rem'
        }
    })
);

interface RowsProps {
    rows: Array<Row<ProjectData>>;
    prepareRow: (row: Row<ProjectData>) => void;
}

// @ts-ignore
export const Rows = React.forwardRef(({ rows, prepareRow }: RowsProps, _) => {
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
                <TableRow {...row.getRowProps()}>
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
});
