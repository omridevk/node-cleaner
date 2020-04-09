import TextField from '@material-ui/core/TextField';
import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import FolderIcon from '@material-ui/icons/Folder';
import { remote } from 'electron';
const { dialog } = remote;
import { createStyles } from '@material-ui/core';
import { head, isEmpty } from 'ramda';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles(() =>
    createStyles({
        inputField: {
            marginTop: '25px'
            // display: "hidden"
        },
        list: {
            maxHeight: '300px',
            overflow: 'auto'
        },
        changeFolderButton: {
            maxWidth: '200px',
            margin: 'auto'
        },
        listenItemText: {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
        },
        container: {
            display: 'flex',
            flexDirection: 'column'
        }
    })
);

interface Props {
    onChange: (folder: string[]) => void;
    directories: string[];
    placeholder?: string;
}
export const FolderInput: React.FC<Props> = ({
    onChange,
    directories = [],
    placeholder = '/'
}) => {
    const classes = useStyles();

    function handleShowDialog() {
        dialog
            .showOpenDialog({
                properties: ['openDirectory', 'multiSelections'],
                message: 'Choose folder to scan'
            })
            .catch(e => console.error(e))
            .then(({ filePaths }) => {
                if (isEmpty(filePaths)) {
                    onChange([placeholder]);
                    return;
                }
                onChange(filePaths);
            });
    }

    return (
        <div className={classes.container}>
            <Button
                classes={{ root: classes.changeFolderButton }}
                variant="contained"
                onClick={handleShowDialog}
                color="primary"
            >
                {directories.length > 1 ? 'Change folders' : 'Choose folders'}
            </Button>
            {directories.length > 1 && (
                <List classes={{ root: classes.list }}>
                    {directories.map(directory => (
                        <ListItem key={directory}>
                            <ListItemIcon>
                                <FolderIcon />
                            </ListItemIcon>
                            <Tooltip title={directory}>
                                <ListItemText
                                    classes={{
                                        primary: classes.listenItemText
                                    }}
                                    primary={directory}
                                />
                            </Tooltip>
                        </ListItem>
                    ))}
                </List>
            )}
            {directories.length < 2 && (
                <TextField
                    classes={{
                        root: classes.inputField
                    }}
                    onChange={event => onChange([event.target.value || ''])}
                    value={head(directories)}
                    placeholder={placeholder}
                    id="outlined-basic"
                    label="Base directory"
                    variant="outlined"
                />
            )}
        </div>
    );
};
