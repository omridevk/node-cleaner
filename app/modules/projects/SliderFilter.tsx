import React, { useMemo } from 'react';
import Slider from '@material-ui/core/Slider';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';
import { ProjectData } from '../../types';
import { FilterValue, IdType, Row } from 'react-table';
import { formatByBytes } from '../../utils/helpers';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles(() =>
    createStyles({
        container: {
            position: 'absolute',
            top: 'calc(50% + 10px)',
            maxWidth: "80%",
            left: "15%"
        }
    })
);

interface Props {
    column: {
        filterValue: FilterValue;
        setFilter: (
            updater: ((filterValue: FilterValue) => FilterValue) | FilterValue
        ) => void;
        preDefinedRow: Array<Row<ProjectData>>;
        preFilteredRows: Array<Row<ProjectData>>;
        id: IdType<any>;
    };
}

interface ValueLabelComponentProps {
    children: React.ReactElement;
    open: boolean;
    value: number;
}

function ValueLabelComponent(props: ValueLabelComponentProps) {
    const { children, open, value } = props;
    const size = useMemo(() => {
        return formatByBytes(value);
    }, [open, value]);
    return (
        <Tooltip open={open} enterTouchDelay={0} placement="top" title={size}>
            {children}
        </Tooltip>
    );
}

export const SliderColumnFilter = ({
    column: { filterValue, setFilter, preFilteredRows, id }
}: Props) => {

    const classes = useStyles();
    // calculate the min max of the slider based on the
    // max values in the table.
    const [min, max] = useMemo(() => {
        let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
        let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
        preFilteredRows.forEach((row: Row<ProjectData>) => {
            min = Math.min(row.values[id], min);
            max = Math.max(row.values[id], max);
        });
        return [min, max];
    }, [id, preFilteredRows]);

    return (
        <Slider
            classes={{
                root: classes.container
            }}
            onClick={e => e.stopPropagation()}
            value={filterValue || min}
            max={max}
            color={'primary'}
            min={min}
            ValueLabelComponent={ValueLabelComponent}
            valueLabelDisplay="auto"
            step={1024}
            onChange={(_, value) => {
                setFilter(value);
            }}
        />
    );
};
