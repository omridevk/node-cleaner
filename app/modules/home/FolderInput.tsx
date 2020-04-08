import TextField from '@material-ui/core/TextField';
import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
// import path from 'path';
import { createStyles } from '@material-ui/core';

const useStyles = makeStyles(() =>
    createStyles({
        inputField: {
            marginTop: '25px'
            // display: "hidden"
        }
    })
);

interface Props {
    onChange: (value: string) => void;
    directory: string;
    placeholder?: string;
}
export const FolderInput: React.FC<Props> = ({
    onChange,
    directory,
    placeholder = "'/'"
}) => {
    const classes = useStyles();
    return (
        <TextField
            classes={{
                root: classes.inputField
            }}
            onChange={event => onChange(event.target.value || '')}
            value={directory}
            placeholder={placeholder}
            id="outlined-basic"
            label="Base directory"
            variant="outlined"
        />
    );
};
