import { IdType, Row } from 'react-table';
import { ProjectData } from '../../types';
import { formatByBytes, sumBySize } from '../../utils/helpers';
import * as R from 'ramda';
import Typography from '@material-ui/core/Typography';
import MaUToolbar from '@material-ui/core/Toolbar';
import clsx from 'clsx';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import React, { useContext, useMemo } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {
    createStyles,
    darken,
    emphasize,
    fade,
    lighten,
    Theme
} from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import { ProjectDataContext } from '../../containers/Root';
import { compose } from 'ramda';
import withStyles from '@material-ui/core/styles/withStyles';
import LinearProgress from '@material-ui/core/LinearProgress';
import useTheme from '@material-ui/core/styles/useTheme';
import { ProjectStatus } from '../../types/Project';
import { TableSearchField } from '../../common/TableSearchField';

interface ToolbarProps {
    selectedRowIds: Record<IdType<ProjectData>, boolean>;
    selectedFlatRows: Array<Row<ProjectData>>;
    preGlobalFilteredRows: any;
    globalFilter: any;
    setGlobalFilter: any;
    searchText?: string;
    onDeleteSelected: (projects: ProjectData[]) => void;
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
            alignItems: 'center'
        }
    })
);



interface HeaderProps {
    numSelected: number;
    projects: ProjectData[];
    totalSizeString?: string;
    totalSelectedSize?: string;
    totalSpace: { free: string; size: string };
}

const InfoIcon = withStyles({
    root: ({ theme, color }: { theme: Theme; color?: string }) => {
        if (!color && theme.palette.type === 'dark') {
            color = theme.palette.primary.light;
        }
        color = color ? color : theme.palette.primary.main;

        return {
            width: '14px',
            height: '14px',
            transform: 'translateY(2px)',
            margin: '0 4px',
            backgroundColor: color,
            display: 'inline-block',
            borderRadius: '30%'
            // border: `1px solid ${emphasize(color, 0.5)}`
        };
    }
})(({ classes }: { theme: Theme; color?: string; classes?: any }) => {
    return <div className={classes.root} />;
});
const Header = ({
    numSelected,
    projects = [],
    totalSizeString = '',
    totalSelectedSize = '',
    totalSpace
}: HeaderProps) => {
    const theme = useTheme();
    return (
        <>
            <Typography color="inherit" variant="subtitle1">
                {numSelected
                    ? `${numSelected}/${projects.length} selected, size: ${totalSelectedSize}`
                    : ''}{' '}
                {!numSelected
                    ? `${projects.length} Projects found, total size: ${totalSizeString}`
                    : ''}
            </Typography>
            <Typography color="inherit" variant="subtitle2">
                <b>Machine Info: {'   '}</b>
                <InfoIcon
                    color={theme.palette.common.white}
                    theme={theme}
                />{' '}
                Capacity: {totalSpace.size} <InfoIcon theme={theme} /> Free:{' '}
                {totalSpace.free}
            </Typography>
        </>
    );
};

export const Toolbar = React.forwardRef(
    (
        {
            selectedFlatRows,
            selectedRowIds,
            preGlobalFilteredRows,
            globalFilter,
            setGlobalFilter,
            onDeleteSelected
        }: ToolbarProps,
        _
    ) => {
        const classes = useToolbarStyles();
        const { totalSizeString, projects = [], totalSpace } = useContext(
            ProjectDataContext
        );
        const activeProjects = useMemo(() => {
            return projects.filter(
                project => project.status !== ProjectStatus.Deleted
            );
        }, [projects]);
        const numSelected = Object.keys(selectedRowIds).length;
        const totalSelectedSize = useMemo(() => {
            const calculateTotalSize = compose(formatByBytes, sumBySize);
            return calculateTotalSize(
                selectedFlatRows.map(row => row.original)
            );
        }, [selectedRowIds]);

        function handleDeleteSelected() {
            onDeleteSelected(selectedFlatRows.map(row => row.original));
        }

        return (
            <MaUToolbar
                className={clsx(classes.root, {
                    [classes.highlight]: numSelected > 0
                })}
            >
                <Header
                    totalSpace={totalSpace}
                    projects={activeProjects}
                    totalSelectedSize={totalSelectedSize}
                    totalSizeString={totalSizeString}
                    numSelected={numSelected}
                />
                <div className={classes.rightSide}>
                    <TableSearchField
                        preGlobalFilteredRows={preGlobalFilteredRows}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                    />
                    {numSelected > 0 ? (
                        <div className={classes.actionsContainer}>
                            <Tooltip title="Delete Selected">
                                <IconButton
                                    aria-label="delete selected"
                                    onClick={handleDeleteSelected}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </div>
                    ) : null}
                </div>
            </MaUToolbar>
        );
    }
);
