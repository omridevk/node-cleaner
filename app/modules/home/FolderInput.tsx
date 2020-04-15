import RemoveIcon from '@material-ui/icons/Remove';
import React, { useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import FolderIcon from '@material-ui/icons/Folder';
import { remote } from 'electron';

const { dialog } = remote;
import { createStyles } from '@material-ui/core';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';

const useStyles = makeStyles(() =>
    createStyles({
        list: {
            maxHeight: '300px',
            overflow: 'auto'
        },
        changeFolderButton: {
            maxWidth: '200px',
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            margin: 'auto'
        },
        listenItemText: {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
        },
        listItemIcon: {
            margin: '0 25px'
        },
        container: {
            display: 'flex',
            flexDirection: 'column'
        }
    })
);

interface Props {
    onChange: (folder: string[]) => void;
}

export const FolderInput: React.FC<Props> = ({
                                                 onChange
                                             }) => {
    const classes = useStyles();
    const [selectedDirectories, setSelectedDirectories] = useState<string[]>([]);

    useEffect(() => {
        onChange([]);
    }, []);

    function handleShowDialog() {
        dialog
            .showOpenDialog({
                properties: ['openDirectory', 'multiSelections'],
                message: 'Choose folder to scan'
            })
            .catch(e => console.error(e))
            .then(result => {
                if (!(result)) {
                    return;
                }
                setSelectedDirectories(result.filePaths);
                onChange(result.filePaths);
            });
    }

    useEffect(() => {
        onChange(selectedDirectories);
    }, [selectedDirectories]);

    function removeFolder(directory: string) {
        setSelectedDirectories(folders => folders.filter((folder => folder !== directory)));
    }

    return (
        <div className={classes.container}>
            <Button
                classes={{ root: classes.changeFolderButton }}
                variant="contained"
                onClick={handleShowDialog}
                color="primary"
            >
                {selectedDirectories.length > 1 ? 'Change folders' : 'Choose folder/s'}
            </Button>

            <List classes={{ root: classes.list }}>
                {selectedDirectories.map(directory => (
                    <ListItem key={directory}>
                        <ListItemAvatar classes={{ root: classes.listItemIcon }}>
                            <Avatar>
                                <FolderIcon/>

                            </Avatar>
                        </ListItemAvatar>
                        <Tooltip title={directory}>
                            <ListItemText
                                classes={{
                                    primary: classes.listenItemText
                                }}
                                primary={directory}
                            />
                        </Tooltip>
                        <Tooltip title={'Remove'}>
                            <ListItemIcon classes={{ root: classes.listItemIcon }}
                                          onClick={() => removeFolder(directory)}>
                                <IconButton>
                                    <RemoveIcon/>
                                </IconButton>
                            </ListItemIcon>
                        </Tooltip>
                    </ListItem>
                ))}
            </List>
        </div>
    );
};
