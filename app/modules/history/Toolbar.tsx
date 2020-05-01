import { IdType, Row } from 'react-table';
import { ProjectData } from '../../types';
import MaUToolbar from '@material-ui/core/Toolbar';
import clsx from 'clsx';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles, lighten, Theme } from '@material-ui/core';
import { TableSearchField } from '../../common/TableSearchField';
import Typography from '@material-ui/core/Typography';

interface ToolbarProps {
    selectedRowIds: Record<IdType<ProjectData>, boolean>;
    selectedFlatRows: Array<Row<ProjectData>>;
    preGlobalFilteredRows: any;
    globalFilter: any;
    setGlobalFilter: any;
    searchText?: string;
}

const useToolbarStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            zIndex: 100,
            justifyContent: 'space-between',
            // position: 'sticky',
            borderBottom: 'solid 1px rgba(0, 0, 0, 0.12)',
            top: 0,
            backgroundColor:
                theme.palette.type === 'light'
                    ? 'rgba(227, 227, 227, 0.85)'
                    : theme.palette.primary.dark
        },
        actionsContainer: {
            display: 'flex'
        },
        highlight:
            theme.palette.type === 'light'
                ? {
                      color: theme.palette.secondary.main,
                      backgroundColor: lighten(
                          theme.palette.secondary.light,
                          0.85
                      )
                  }
                : {
                      color: theme.palette.text.primary,
                      backgroundColor: theme.palette.secondary.dark
                  },
        rightSide: {
            display: 'flex',
            alignItems: 'center',
            marginLeft: 'auto'
        }
    })
);

export const Toolbar = React.forwardRef(
    (
        {
            selectedRowIds,
            preGlobalFilteredRows,
            globalFilter,
            setGlobalFilter
        }: ToolbarProps,
        _
    ) => {
        const classes = useToolbarStyles();
        const numSelected = Object.keys(selectedRowIds).length;

        return (
            <MaUToolbar
                className={clsx(classes.root, {
                    [classes.highlight]: numSelected > 0
                })}
            >
                {numSelected > 0 && (
                    <Typography color="inherit" variant="subtitle1">
                        {numSelected} projects selected
                    </Typography>
                )}
                <div className={classes.rightSide}>
                    <TableSearchField
                        preGlobalFilteredRows={preGlobalFilteredRows}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                    />
                </div>
            </MaUToolbar>
        );
    }
);
