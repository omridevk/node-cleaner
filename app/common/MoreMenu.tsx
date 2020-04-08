import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import IconButton from '@material-ui/core/IconButton';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import React, { MouseEventHandler } from 'react';
import Popper from '@material-ui/core/Popper';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import { createStyles } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Tooltip from '@material-ui/core/Tooltip';

export interface Item {
    title: string;
    action: (event: any) => void;
    disabled?: boolean;
}

const useStyles = makeStyles(() =>
    createStyles({
        popper: {
            zIndex: 999
        }
    })
);

export interface MoreMenuProps {
    items: Item[];
    disabled?: boolean;
    closeOnClick?: boolean;
    tooltip?: string;
}

export const MoreMenu = ({
    items,
    disabled = false,
    closeOnClick = true,
    tooltip
}: MoreMenuProps) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const classes = useStyles();
    const handleClose = () => setAnchorEl(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };
    const open = Boolean(anchorEl);

    return (
        <ClickAwayListener onClickAway={handleClose}>
            <div>
                <Tooltip title={tooltip}>
                    <IconButton onClick={handleClick} disabled={disabled}>
                        <MoreHorizIcon />
                    </IconButton>
                </Tooltip>

                <Popper
                    open={open}
                    anchorEl={anchorEl}
                    transition={true}
                    disablePortal={true}
                    className={classes.popper}
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin:
                                    placement === 'bottom'
                                        ? 'center top'
                                        : 'center bottom'
                            }}
                        >
                            <Paper>
                                <MenuList>
                                    {items.map(item => {
                                        return (
                                            <MenuItem
                                                disabled={
                                                    item.disabled || false
                                                }
                                                key={item.title}
                                                onClick={event => {
                                                    if (item.disabled) {
                                                        return;
                                                    }
                                                    item.action(event);
                                                    if (closeOnClick) {
                                                        setAnchorEl(null);
                                                    }
                                                }}
                                            >
                                                <ListItemText
                                                    primary={item.title}
                                                />
                                            </MenuItem>
                                        );
                                    })}
                                </MenuList>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div>
        </ClickAwayListener>
    );
};
