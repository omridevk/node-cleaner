import React, { MouseEvent } from 'react';
import { Button, createStyles } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import makeStyles from '@material-ui/core/styles/makeStyles';

export enum ScanType {
    All = 'all',
    Folder = 'folder',
    Drives = 'drives'
}

export interface Scan {
    type: ScanType;
    title: string;
    disabled?: boolean;
    visible?: boolean;
}

interface Props {
    scans: Scan[];
    title: string;
    onChangeScan: (scan: Scan) => void;
}
const useStyles = makeStyles(() =>
    createStyles({
        menuListRoot: {
            outline: 0
        },
        container: {
            padding: '10px'
        }
    })
);

export const ScanSelection: React.FC<Props> = ({
    scans,
    onChangeScan,
    title
}) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
        null
    );
    const classes = useStyles();
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div className={classes.container}>
            <Button
                color={'primary'}
                aria-controls="Scan Type"
                aria-haspopup="true"
                onClick={handleClick}
            >
                {title}
            </Button>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuList classes={{ root: classes.menuListRoot }}>
                    {scans.map(
                        ({ title, disabled = false, type, visible = true }) => {
                            if (!visible) {
                                return null;
                            }
                            return (
                                <MenuItem
                                    disabled={disabled}
                                    key={title}
                                    onClick={() => {
                                        handleClose();
                                        onChangeScan({ title, disabled, type });
                                    }}
                                >
                                    {title}
                                </MenuItem>
                            );
                        }
                    )}
                </MenuList>
            </Menu>
        </div>
    );
};
