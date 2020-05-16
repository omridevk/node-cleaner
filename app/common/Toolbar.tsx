import { IdType, Row } from 'react-table';
import { ProjectData } from '../types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles, lighten, Theme } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import Typography from '@material-ui/core/Typography';
import React, { useContext, useMemo } from 'react';
import { ProjectDataContext } from '../containers/Root';
import { ProjectStatus } from '../types/Project';
import { compose } from 'ramda';
import { formatByBytes, sumBySize } from '../utils/helpers';
import MaUToolbar from '@material-ui/core/Toolbar';
import clsx from 'clsx';
import { TableSearchField } from './TableSearchField';
import { useCalculateSize } from '../hooks/useCalculateSize';

interface ToolbarProps {
    selectedRowIds: Record<IdType<ProjectData>, boolean>;
    selectedFlatRows: Array<Row<ProjectData>>;
    preGlobalFilteredRows: any;
    children?: React.ReactNode;
    globalFilter: any;
    setGlobalFilter: any;
    projects: ProjectData[];
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
            projects,
            children = null,
            setGlobalFilter
        }: ToolbarProps,
        _
    ) => {
        const classes = useToolbarStyles();
        const { totalSpace } = useContext(
            ProjectDataContext
        );
        const totalSizeString = useCalculateSize(projects);
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
                        children
                    ) : null}
                </div>
            </MaUToolbar>
        );
    }
);
