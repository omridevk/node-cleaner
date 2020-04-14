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
import { createStyles, lighten, Theme } from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import { ProjectDataContext } from '../../containers/Root';
import { compose } from 'ramda';

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
        title: {
            flex: '1 1 40%'
        }
    })
);

const SearchField = ({
                         preGlobalFilteredRows,
                         globalFilter,
                         setGlobalFilter
                     }: any) => {
    const count = preGlobalFilteredRows.length;
    return (
        <TextField
            value={globalFilter || ''}
            onChange={event => setGlobalFilter(event.target.value || undefined)}
            placeholder={`Search ${count} projects`}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Tooltip title={'Search'}>
                            <SearchIcon color="inherit" fontSize="small"/>
                        </Tooltip>
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            disabled={!globalFilter}
                            onClick={() => setGlobalFilter('')}
                        >
                            <ClearIcon color="inherit" fontSize="small"/>
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    );
};

interface HeaderProps {
    numSelected: number,
    projects: ProjectData[],
    totalSizeString?: string
    totalSelectedSize?: string;
}

const Header = ({ numSelected, projects = [], totalSizeString = '', totalSelectedSize = '' }: HeaderProps) => {
    const classes = useToolbarStyles();
    return (
        <Typography
            className={classes.title}
            color="inherit"
            variant="subtitle1"
        >
            {numSelected ? `${numSelected}/${projects.length} selected, size: ${totalSelectedSize}` : ''}{' '}
            {!numSelected ? `${projects.length} Projects found, total size: ${totalSizeString}` : ''}
        </Typography>
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
        const { totalSizeString, projects = [] } = useContext(
            ProjectDataContext
        );
        const numSelected = Object.keys(selectedRowIds).length;
        const totalSelectedSize = useMemo(() => {
            const calculateTotalSize = compose(formatByBytes, sumBySize);
            return calculateTotalSize(selectedFlatRows.map(row => row.original));
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
                <Header projects={projects} totalSelectedSize={totalSelectedSize} totalSizeString={totalSizeString}
                        numSelected={numSelected}/>
                <SearchField
                    preGlobalFilteredRows={preGlobalFilteredRows}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                />
                <div className={classes.actionsContainer}>
                    {numSelected > 0 ? (
                        <Tooltip title="Delete Selected">
                            <IconButton
                                aria-label="delete selected"
                                onClick={handleDeleteSelected}
                            >
                                <DeleteIcon/>
                            </IconButton>
                        </Tooltip>
                    ) : null}
                </div>
            </MaUToolbar>
        );
    }
);
