import React, { useEffect, useMemo, useState } from 'react';
import Container from '@material-ui/core/Container';
import { createStyles } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import { ScanButton } from './ScanButton';
import { Scan, ScanSelection, ScanType } from './ScanSelection';
import { FolderInput } from './FolderInput';
import { DriveSelector } from './DriveSelector';
import { Drive } from '../../utils/list-drives';
import { isDarwin, isWin } from '../../constants';
import { isEmpty } from 'ramda';

const useStyles = makeStyles(() =>
    createStyles({
        gridRoot: {
            height: '100%',
            width: '100%',
        },
        containerRoot: {
            height: '100%',
        },
        settingsContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '135px',
        },
    })
);

const isWindows = process.platform === 'win32';

interface Props {
    drives: Drive[];
}

export default function Home({ drives }: Props) {
    const classes = useStyles();
    const [directories, setDirectories] = useState<string[]>([]);
    const [scan, setScan] = useState<Scan>({
        type: ScanType.All,
        title: 'All',
    });
    useEffect(() => {
        const dirs = drives.map(({ path }) => path);
        if (isEmpty(dirs)) {
            setDirectories(['/']);
            return;
        }
        setDirectories(dirs);
    }, [drives, setDirectories]);
    useEffect(() => {
        if (scan.type !== ScanType.All) {
            return;
        }
        setDirectories(drives.map(({ path }) => path));
    }, [scan, setDirectories, drives]);
    const scans = useMemo(() => {
        return [
            {
                type: ScanType.All,
                title: 'All',
            },
            {
                type: ScanType.Folder,
                title: 'Folder',
            },
            {
                type: ScanType.Drives,
                title: 'Drives',
                visible: drives.length > 1,
            },
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
    }

    const shouldDisableScan =
        isWindows && scan.type === ScanType.All && !directories.length;

    return (
        <Container
            maxWidth={false}
            disableGutters
            classes={{
                root: classes.containerRoot,
            }}
        >
            <Grid
                classes={{
                    root: classes.gridRoot,
                }}
                container
                direction="column"
                justify="center"
                alignItems="center"
            >
                <ScanButton
                    scanType={scan.type}
                    disabled={shouldDisableScan}
                    directories={directories}
                />
                <div className={classes.settingsContainer}>
                    <ScanSelection
                        selectedScan={scan}
                        onChangeScan={handleScanChanged}
                        scans={scans}
                    />
                    {scan.type === ScanType.Folder && (
                        <FolderInput onChange={handleFolderChanged} />
                    )}
                    {scan.type === ScanType.Drives && drives.length > 1 && (
                        <DriveSelector
                            drives={drives}
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
