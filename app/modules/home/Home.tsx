import React, { useEffect, useMemo, useState } from 'react';
import Container from '@material-ui/core/Container';
import { createStyles } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import { ScanButton } from './ScanButton';
import { Scan, ScanSelection, ScanType } from './ScanSelection';
import { FolderInput } from './FolderInput';
import { head } from 'ramda';
import { DriveSelector } from './DriveSelector';
import { Drive } from '../../utils/list-drives';
import { isDarwin } from '../../constants';

const useStyles = makeStyles(() =>
    createStyles({
        gridRoot: {
            height: '100%',
            width: '100%'
        },
        containerRoot: {
            height: '100%'
        },
        settingsContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }
    })
);

const isWindows = process.platform === 'win32';

interface Props {
    drives: Drive[];
}

export default function Home({ drives }: Props) {
    const classes = useStyles();
    const [directories, setDirectories] = useState<string[]>([]);
    const [selectedDrives, setSelectedDrives] = useState<Drive[]>([]);
    const [scan, setScan] = useState<Scan>({
        type: ScanType.All,
        title: 'All'
    });
    useEffect(() => {
        setDirectories(
            drives.filter(({ path }) => path !== '/').map(({ path }) => path)
        );
    }, [drives]);
    useEffect(() => {
        if (!isDarwin || scan.type !== ScanType.All) {
            return;
        }
        setDirectories(['/']);
    }, [drives, scan]);

    const scans = useMemo(() => {
        return [
            {
                type: ScanType.All,
                title: 'All'
            },
            {
                type: ScanType.Folder,
                title: 'Folder'
            },
            {
                type: ScanType.Drives,
                title: 'Drives',
                visible: drives.length > 1
            }
        ];
    }, [drives]);

    function handleScanChanged(scan: Scan) {
        setScan(scan);
    }
    function handleFolderChanged(folders: string[]) {
        setDirectories(folders);
    }
    function handleDriveChanged(drives: Drive[]) {
        setDirectories(drives.map(({ path }) => path));
        setSelectedDrives(drives);
    }

    const shouldDisableScan =
        isWindows && scan.type === ScanType.All && !directories.length;

    return (
        <Container
            maxWidth={false}
            disableGutters
            classes={{
                root: classes.containerRoot
            }}
        >
            <Grid
                classes={{
                    root: classes.gridRoot
                }}
                container
                direction="column"
                justify="center"
                alignItems="center"
            >
                <ScanButton
                    disabled={shouldDisableScan}
                    directories={directories}
                />
                <div className={classes.settingsContainer}>
                    <ScanSelection
                        onChangeScan={handleScanChanged}
                        scans={scans}
                        title={scan.title}
                    />
                    {scan.type === ScanType.Folder && (
                        <FolderInput
                            directories={directories}
                            onChange={handleFolderChanged}
                        />
                    )}
                    {scan.type === ScanType.Drives && drives.length > 1 && (
                        <DriveSelector
                            drives={drives}
                            selectedDrives={selectedDrives}
                            onChange={handleDriveChanged}
                        />
                    )}
                </div>
            </Grid>
        </Container>
    );
}
/**
 * if (scan.type === ScanType.All) {
        setState(drives);
        return null;
    }
 if (scan.type === ScanType.Folder) {
        return (
            <FolderInput
                onChange={folder => setState([folder])}
                directory={head(directories)!}
            />
        );
    }
 if (scan.type === ScanType.Drives) {
        return (
            <DriveSelector
                drives={drives}
                selectedDrives={selectedDrives}
                onChange={drives => setState(drives)}
            />
        );
    }
 */
