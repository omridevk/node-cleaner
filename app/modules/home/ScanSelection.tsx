import React from 'react';
import { createStyles } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';

export enum ScanType {
    All = 'all',
    Folder = 'folder',
    Drives = 'drives',
}

export interface Scan {
    type: ScanType;
    title: string;
    disabled?: boolean;
    visible?: boolean;
}

interface Props {
    scans: Scan[];
    selectedScan: Scan;
    onChangeScan: (scan: Scan) => void;
}

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            padding: '10px',
            flexDirection: 'row',
        },
        formLabel: {
            alignSelf: 'center',
        },
        menuListRoot: {
            outline: 0,
        },
        container: {
            padding: '10px',
        },
    })
);

export const ScanSelection: React.FC<Props> = ({
    scans,
    selectedScan,
    onChangeScan,
}) => {
    const classes = useStyles();
    function handleChange(event) {
        const scan = scans.find((scan) => scan.type === event.target.value);
        if (!scan) {
            return;
        }
        onChangeScan(scan);
    }

    return (
        <FormControl classes={{ root: classes.root }}>
            <FormLabel classes={{ root: classes.formLabel }} component="legend">
                Scan Type:
            </FormLabel>
            <RadioGroup
                classes={{ root: classes.root }}
                aria-label="Scan Select"
                name="scan-select"
                value={selectedScan.type}
                onChange={handleChange}
            >
                {scans.map(({ type, title, disabled, visible = true }) =>
                    visible ? (
                        <FormControlLabel
                            key={type}
                            value={type}
                            control={<Radio />}
                            label={title}
                            disabled={disabled}
                        />
                    ) : null
                )}
            </RadioGroup>
        </FormControl>
    );
};
