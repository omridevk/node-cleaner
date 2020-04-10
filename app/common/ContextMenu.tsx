import React, { useEffect, useState } from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { ProjectData } from '../types';

export interface Item {
    text: string;
    action: any;
}
interface Props {
    items: Item[];
    mouseX: number | null;
    mouseY: number | null;
    project: ProjectData | null;
}

export const ContextMenu: React.FC<Props> = ({ items, mouseY, mouseX }) => {
    const [open, setOpen] = useState(!!mouseY);
    useEffect(() => {
        if (mouseY === null) {
            setOpen(false);
            return;
        }
        setOpen(true);
    }, [mouseY]);

    function handleClose() {
        setOpen(false);
    }

    return (
        <Menu
            keepMounted
            open={open}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
                mouseY !== null && mouseX !== null
                    ? { top: mouseY, left: mouseX }
                    : undefined
            }
        >
            {items.map((item, index) => (
                <MenuItem
                    key={index}
                    onClick={e => {
                        setOpen(false);
                        item.action(e);
                    }}
                >
                    {item.text}
                </MenuItem>
            ))}
        </Menu>
    );
};
