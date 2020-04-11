import { Finder } from '../utils/finder';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ProjectData } from '../types';
import { tap, first, catchError } from 'rxjs/operators';
import { Drive } from '../utils/list-drives';
import compose from 'ramda/src/compose';
import sum from 'ramda/src/sum';
import map from 'ramda/src/map';
import prop from 'ramda/src/prop';
import { formatByBytes } from '../utils/helpers';
import * as electronLog from 'electron-log';
import path from 'path';
import * as R from 'ramda';
import { EMPTY, forkJoin, from } from 'rxjs';
import chalk from 'chalk';
import fs from 'fs-extra';

const logger = electronLog.create('use-scan');
export enum ScanState {
    Loading = 'loading',
    Finished = 'finished',
    Idle = 'idle'
}
export enum DeleteState {
    Deleting = 'deleting',
    Idle = 'idle',
    Finished = 'finished'
}
export interface State {
    deleting: DeleteState;
    scanning: ScanState;
}

enum Actions {
    StartScan,
    PauseScan,
    FinishedScan,
    Reset,
    DeleteProjects,
    FinishedDelete
}

function reducer(state: State, action: any): State {
    switch (action.type) {
        case Actions.Reset:
            return {
                scanning: ScanState.Idle,
                deleting: DeleteState.Idle
            };
        case Actions.StartScan:
            return {
                ...state,
                scanning: ScanState.Loading
            };
        case Actions.PauseScan:
            return {
                ...state,
                scanning: ScanState.Idle
            };
        case Actions.FinishedScan:
            return {
                ...state,
                scanning: ScanState.Finished
            };
        case Actions.DeleteProjects:
            return {
                ...state,
                deleting: DeleteState.Deleting
            };
        case Actions.FinishedDelete:
            return {
                ...state,
                deleting: DeleteState.Finished
            };
        default:
            throw new Error();
    }
}

export const useScan = () => {
    const finder = useRef<Finder>();
    if (!finder.current) {
        finder.current = new Finder();
    }
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [foldersScanned, setFoldersScanned] = useState(0);
    const folders = useRef<string | string[]>();
    const [deletedProjects, setDeletedProjects] = useState<ProjectData[]>([]);
    const [drives, setDrives] = useState<Drive[]>([]);
    const [state, dispatch] = useReducer(reducer, {
        scanning: ScanState.Idle,
        deleting: DeleteState.Idle
    });
    const sumSize = compose(sum, map(prop('size')));
    const totalSizeString = useMemo(() => formatByBytes(sumSize(projects)), [
        projects
    ]);
    function startScan(dir: string | string[]) {
        finder.current!.start(dir);
        folders.current = dir;
        dispatch({ type: Actions.StartScan });
    }
    function deleteProjects(deletedProjects: ProjectData[]) {
        dispatch({ type: Actions.DeleteProjects });
        const paths = deletedProjects.map(
            project => `${path.join(project.path, 'node_modules')}`
        );

        logger.info(
            chalk.yellowBright(
                `removing projects ${chalk.redBright(
                    deletedProjects.map(project => project.name).join(' , ')
                )}`
            )
        );
        forkJoin(
            paths.map(path =>
                from(fs.remove(path)).pipe(
                    catchError(e => {
                        logger.error(e);
                        return EMPTY;
                    })
                )
            )
        )
            // exec(`rm -rf ${paths}`)
            .pipe(first())
            .subscribe(
                () => {
                    setDeletedProjects(deletedProjects);
                    const comp = (x: ProjectData, y: ProjectData) =>
                        x.path === y.path;
                    finder.current?.updateProjects(
                        R.differenceWith(comp, projects, deletedProjects)
                    );
                    dispatch({ type: Actions.FinishedDelete });
                },
                e => console.log(e)
            );
    }
    function resetProjects() {
        setProjects([]);
        setDeletedProjects([]);
    }
    function resetScan() {
        finder.current?.destroy();
        resetProjects();
        dispatch({ type: Actions.Reset });
        if (!folders.current) {
            return;
        }
        startScan(folders.current);
    }
    function pauseScan() {
        dispatch({ type: Actions.PauseScan });
        finder.current?.pause();
    }
    function stopScan() {
        dispatch({ type: Actions.FinishedScan });
        finder.current?.cancel();
    }
    function resumeScan() {
        dispatch({ type: Actions.StartScan });
        finder.current?.resume();
    }
    useEffect(() => {
        const scanEndSub = finder.current!.onScanEnd.subscribe(() =>
            dispatch({ type: Actions.FinishedScan })
        );
        const totalFoldersScannedSub = finder.current?.foldersScanned$.subscribe(
            number => setFoldersScanned(number)
        );
        const scanDriveSub = finder.current
            ?.scanDrives()
            .subscribe(drives => setDrives(drives));
        const getProjectsSub = finder.current?.projects$
            .pipe(tap(projects => setProjects(projects)))
            .subscribe();
        const subscriptions = [
            getProjectsSub,
            scanDriveSub,
            scanEndSub,
            totalFoldersScannedSub
        ];
        return () => {
            subscriptions.forEach(sub => sub?.unsubscribe());
            finder.current!.destroy();
        };
    }, []);

    return {
        projects,
        startScan,
        resetProjects,
        deleteProjects,
        deletedProjects,
        totalSizeString,
        foldersScanned,
        pauseScan,
        resumeScan,
        resetScan,
        stopScan,
        state,
        drives
    };
};
