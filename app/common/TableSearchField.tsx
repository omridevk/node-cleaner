import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import React from 'react';

export const TableSearchField = ({
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
                            <SearchIcon color="inherit" fontSize="small" />
                        </Tooltip>
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            disabled={!globalFilter}
                            onClick={() => setGlobalFilter('')}
                        >
                            <ClearIcon color="inherit" fontSize="small" />
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    );
};