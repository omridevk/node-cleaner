import React, { useContext, useEffect, useMemo, useState } from 'react';
import Container from '@material-ui/core/Container';
import { createStyles } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import { ScanButton } from './ScanButton';
import { Scan, ScanSelection, ScanType } from './ScanSelection';
import { FolderInput } from './FolderInput';
import { DriveSelector } from './DriveSelector';
import { Drive } from '../../utils/list-drives';
import { isEmpty } from 'ramda';
import { ProjectDataContext } from '../../containers/Root';
import { ScanState } from '../../hooks/useScan';

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
            alignItems: 'center',
            minHeight: '135px'
        }
    })
);

const isWindows = process.platform === 'win32';

interface Props {
    drives: Drive[];
}

export default function Home({ drives }: Props) {
    const classes = useStyles();
    const { setFolders, state, resetScan } = useContext(ProjectDataContext);
    const { folders } = state;
    const [scan, setScan] = useState<Scan>({
        type: ScanType.All,
        title: 'All'
    });
    useEffect(() => {
        const dirs = drives.map(({ path }) => path);
        if (isEmpty(dirs)) {
            setFolders(['/']);
            return;
        }
        setFolders(dirs);
    }, [drives]);
    useEffect(() => {
        if (scan.type !== ScanType.All) {
            return;
        }
        setFolders(drives.map(({ path }) => path));
    }, [scan, drives]);
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
        setFolders(folders);
    }

    function handleDriveChanged(drives: Drive[]) {
        setFolders(drives.map(({ path }) => path));
    }

    const shouldDisableScan =
        (isWindows && scan.type === ScanType.All && !folders.length) ||
        !drives.length;

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
                    scanning={state.scanning !== ScanState.Idle}
                    scanType={scan.type}
                    resetScan={resetScan}
                    disabled={shouldDisableScan}
                    directories={folders}
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
