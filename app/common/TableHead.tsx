import { HeaderGroup, Meta } from 'react-table';
import { ProjectData } from '../types';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import MuiTableHead from '@material-ui/core/TableHead';
import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';

interface Props {
    headerGroups: Array<
        (
            allColumns: Array<HeaderGroup<ProjectData>>,
            meta: Meta<ProjectData>
        ) => Array<HeaderGroup<ProjectData>>
    >;
}

const useStyles = makeStyles(() =>
    createStyles({
        rowRoot: {
            maxHeight: '80px'
        },
        cellRoot: {
            '&>div': {
                display: 'inline-block'
            },
            borderRight: 'solid 1px rgba(0, 0, 0, 0.12)',
            lineHeight: '2.5rem'
        },
        resizer: {
            display: 'inline-block',
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
            width: '5px',
            opacity: 0,
            height: '100%',
            position: 'absolute',
            right: 0,
            top: 0,
            transform: 'translateX(50%)',
            zIndex: 10
        },
        tableSortLabelRoot: {
            display: 'none'
        }
    })
);

export const TableHead: React.FC<Props> = ({ headerGroups }) => {
    const classes = useStyles();

    return (
        <MuiTableHead component='div'>
            {headerGroups.map((headerGroup: any) => (
                <TableRow
                    component="div"
                    {...headerGroup.getHeaderGroupProps()}
                    classes={{
                        root: classes.rowRoot
                    }}
                >
                    {headerGroup.headers.map((column: any) => (
                        <TableCell
                            component="div"
                            {...column.getHeaderProps(
                                column.getSortByToggleProps()
                            )}
                            classes={{
                                root: classes.cellRoot
                            }}
                        >
                            {column.render('Header')}
                            <div>
                                {column.canFilter
                                    ? column.render('Filter')
                                    : null}
                            </div>
                            {!column.disableResizing && (
                                <div
                                    {...column.getResizerProps()}
                                    className={classes.resizer}
                                />
                            )}
                            <TableSortLabel
                                classes={{
                                    root: column.canSort
                                        ? ''
                                        : classes.tableSortLabelRoot
                                }}
                                active={column.isSorted}
                                direction={column.isSortedDesc ? 'desc' : 'asc'}
                            />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </MuiTableHead>
    );
};
