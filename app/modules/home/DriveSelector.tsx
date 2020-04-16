import React, { useEffect, useState } from 'react';
import { FormControl } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import Input from '@material-ui/core/Input';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Drive } from '../../utils/list-drives';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        maxWidth: 250,
        minWidth: 250
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: 2,
    },
    noLabel: {
        marginTop: theme.spacing(3),
    },
    labelId: {},
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    variant: 'menu',
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

interface Props {
    drives: Drive[];
    onChange: (drives: Drive[]) => void;
}
export const DriveSelector: React.FC<Props> = ({ drives, onChange }) => {
    const classes = useStyles();
    const [selectedDrives, setSelectedDrives] = useState<Drive[]>([]);

    useEffect(() => {
        onChange(selectedDrives);
    }, [selectedDrives]);

    return (
        <FormControl className={classes.formControl}>
            <InputLabel id={'drive-selector-label'}>Drives</InputLabel>
            <Select
                labelId={'drive-selector-label'}
                id={'drive-selector'}
                multiple
                value={selectedDrives}
                onChange={(event) =>
                    setSelectedDrives(event.target.value as Drive[])
                }
                input={<Input />}
                renderValue={(selected) => {
                    return (
                        <Typography variant="body1" noWrap={true}>
                            {selected.map(({ name }) => name).join(', ')}
                        </Typography>
                    );
                }}
                MenuProps={MenuProps}
            >
                {drives.map((drive) => (
                    <MenuItem key={drive.path} value={drive}>
                        <Checkbox checked={selectedDrives.includes(drive)} />
                        <ListItemText primary={drive.name} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
