import { Finder } from '../utils/finder';
import { useEffect, useReducer, useRef, useState } from 'react';
import { ProjectData } from '../types';
import { catchError, delay, first, map, tap } from 'rxjs/operators';
import { Drive } from '../utils/list-drives';
import path from 'path';
import { EMPTY, forkJoin, from } from 'rxjs';
import chalk from 'chalk';
import { ProjectStatus } from '../types/Project';
import { eqBy, prop, unionWith } from 'ramda';
import fs from 'fs-extra';
import { useCalculateSize } from './useCalculateSize';
import * as logger from 'electron-log';

// const logger = log.scope("use-scan-hook");

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

const demoMode = !!process.env.DEMO_MODE;

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
    const totalSizeString = useCalculateSize(projects);
    function startScan(dir: string | string[]) {
        finder.current!.start(dir);
        folders.current = dir;
        dispatch({ type: Actions.StartScan });
    }
    function deleteProjects(deletedProjects: ProjectData[]) {
        dispatch({ type: Actions.DeleteProjects });
        updateProjectsStatus(deletedProjects, ProjectStatus.Deleting);
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
            demoMode
                ? from([0]).pipe(delay(5000))
                : paths.map(path =>
                      from(fs.remove(path)).pipe(
                          catchError(e => {
                              console.error(e);
                              return EMPTY;
                          })
                      )
                  )
        )
            .pipe(first())
            .subscribe(
                () => {
                    setDeletedProjects(deletedProjects);
                    updateProjectsStatus(
                        deletedProjects,
                        ProjectStatus.Deleted
                    );
                    dispatch({ type: Actions.FinishedDelete });
                },
                e => logger.error(e)
            );
    }

    function updateProjectsStatus(
        updatedProjects: ProjectData[],
        status: ProjectStatus
    ) {
        updatedProjects = updatedProjects.map(project => ({
            ...project,
            status: status
        }));
        finder.current!.updateProjects(
            updatedProjects
        );
    }
    function resetScan() {
        finder.current?.destroy();
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
            .pipe(
                map(projects =>
                    projects.filter(
                        project => project.status !== ProjectStatus.Deleted
                    )
                ),
                tap(projects => setProjects(projects))
            )
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
