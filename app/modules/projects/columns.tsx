import React, { useMemo } from 'react';
import { FilterValue, IdType, Row } from 'react-table';
import { ProjectData } from '../../types';
import { formatByBytes } from '../../utils/helpers';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';
import Tooltip from '@material-ui/core/Tooltip';
import { SliderColumnFilter } from './SliderFilter';

// Define a custom filter filter function!
function filterGreaterThan(
    rows: Array<Row<ProjectData>>,
    id: IdType<any>,
    filterValue: FilterValue
) {
    return rows.filter(row => {
        const rowValue = row.values[id];
        return rowValue >= filterValue;
    });
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val: any) => typeof val !== 'number';

// Define a default UI for filtering
export const DefaultColumnFilter = () => {
    return null;
};

export default () =>
    useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
                defaultCanFilter: false
            },
            {
                Header: 'Size',
                accessor: 'size',
                sortInverted: true,
                Filter: SliderColumnFilter,
                filter: filterGreaterThan,
                Cell: ({ row }: { row: Row<ProjectData> }) => (
                    <div>{formatByBytes(row.original.size)}</div>
                ),
                disableResizing: true
            },
            {
                Header: 'Last modified',
                accessor: 'lastModified',
                defaultCanFilter: false,
                Cell: ({ row }: { row: Row<ProjectData> }) => (
                    <Typography variant="subtitle1">
                        {moment(row.original.lastModified).fromNow()}
                    </Typography>
                ),
                disableResizing: true
            },
            {
                Header: 'Description',
                accessor: 'description',
                Cell: ({ row }: { row: Row<ProjectData> }) => {
                    const { original } = row;
                    return (
                        <Tooltip
                            title={original.description || ''}
                            aria-label={original.description || ''}
                            placement="top"
                        >
                            <Typography variant="subtitle1" noWrap>
                                {original.description}
                            </Typography>
                        </Tooltip>
                    );
                }
            },
            {
                Header: 'Full Path',
                accessor: 'path',
                Cell: ({ row }: { row: Row<ProjectData> }) => {
                    const { original } = row;
                    return (
                        <Tooltip
                            title={original.path}
                            aria-label={original.path}
                            placement="top"
                        >
                            <Typography variant="subtitle1" noWrap>
                                {original.path}
                            </Typography>
                        </Tooltip>
                    );
                }
            }
        ],
        []
    );
