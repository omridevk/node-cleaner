import { Finder } from '../utils/finder';
import {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from 'react';
import { ProjectData } from '../types';
import { catchError, delay, first, map, tap } from 'rxjs/operators';
import { Drive } from '../utils/list-drives';
import path from 'path';
import { bindCallback, bindNodeCallback, EMPTY, forkJoin, from } from 'rxjs';
import chalk from 'chalk';
import { ProjectStatus } from '../types/Project';
import fs from 'fs';
import { useCalculateSize } from './useCalculateSize';
import * as logger from 'electron-log';
import { formatByBytes, sumBy } from '../utils/helpers';
import checkDiskSpace, { CheckDiskSpaceResult } from 'check-disk-space';
import { compose, uniq } from 'ramda';
import rimraf from 'rimraf';
import { exec } from 'child_process';
import { isDarwin, isLinux, isWin } from '../constants';

const rimraf$ = bindCallback(rimraf);
export enum ScanState {
    Loading = 'loading',
    Finished = 'finished',
    Idle = 'idle',
}

export enum DeleteState {
    Deleting = 'deleting',
    Idle = 'idle',
    Finished = 'finished',
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
    FinishedDelete,
}

function reducer(state: State, action: any): State {
    switch (action.type) {
        case Actions.Reset:
            return {
                scanning: ScanState.Idle,
                deleting: DeleteState.Idle,
            };
        case Actions.StartScan:
            return {
                ...state,
                scanning: ScanState.Loading,
            };
        case Actions.PauseScan:
            return {
                ...state,
                scanning: ScanState.Idle,
            };
        case Actions.FinishedScan:
            return {
                ...state,
                scanning: ScanState.Finished,
            };
        case Actions.DeleteProjects:
            return {
                ...state,
                deleting: DeleteState.Deleting,
            };
        case Actions.FinishedDelete:
            return {
                ...state,
                deleting: DeleteState.Finished,
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
    const [totalSpace, setTotalSpace] = useState({ free: '', size: '' });
    const folders = useRef<string | string[]>();
    const [deletedProjects, setDeletedProjects] = useState<ProjectData[]>([]);
    const [drives, setDrives] = useState<Drive[]>([]);
    const [state, dispatch] = useReducer(reducer, {
        scanning: ScanState.Idle,
        deleting: DeleteState.Idle,
    });

    useEffect(() => {
        if (!folders.current) {
            return;
        }
        let dirs = Array.isArray(folders.current)
            ? folders.current
            : [folders.current];
        dirs = uniq(dirs.map((dir) => path.parse(dir).root));
        const calculateFreeSpace = compose(formatByBytes, sumBy('free'));
        const calculateSize = compose(formatByBytes, sumBy('size'));
        Promise.all(dirs.map((dir) => checkDiskSpace(dir))).then(
            (sizes: CheckDiskSpaceResult[]) => {
                setTotalSpace({
                    free: calculateFreeSpace(sizes),
                    size: calculateSize(sizes),
                });
            }
        );
    }, [folders.current]);

    const totalSizeString = useCalculateSize(projects);

    const startScan = useCallback(
        (dir: string | string[]) => {
            finder.current!.start(dir);
            folders.current = dir;
            dispatch({ type: Actions.StartScan });
        },
        [finder.current, dispatch]
    );

    const updateProjectsStatus = useCallback(
        ({
            updatedProjects,
            status,
        }: {
            updatedProjects: ProjectData[];
            status: ProjectStatus;
        }) => {
            updatedProjects = updatedProjects.map((project) => ({
                ...project,
                status: status,
            }));
            finder.current!.updateProjects(updatedProjects);
        },
        [finder.current]
    );

    const deleteProjects = useCallback(
        (deletedProjects: ProjectData[]) => {
            dispatch({ type: Actions.DeleteProjects });
            updateProjectsStatus({
                updatedProjects: deletedProjects,
                status: ProjectStatus.Deleting,
            });
            const paths = deletedProjects.map(
                (project) => `${path.join(project.path, 'node_modules')}`
            );

            logger.info(
                chalk.yellowBright(
                    `removing projects ${chalk.redBright(
                        deletedProjects
                            .map((project) => project.name)
                            .join(' , ')
                    )}`
                )
            );

            const command = useMemo(() => {
                if (isWin) {
                    return 'deltree';
                }
                return 'rm -rf';
            }, []);

            forkJoin(
                demoMode
                    ? from([0]).pipe(delay(5000))
                    : paths.map(
                          (path) => bindNodeCallback(exec)(`${command} "${path}"`)
                          // rimraf$(`${path}`).pipe(
                          //     catchError((e) => {
                          //         console.error(e);
                          //         return EMPTY;
                          //     })
                          // )
                      )
            )
                .pipe(
                    catchError((e) => {
                        console.error(e);
                        return EMPTY;
                    }),
                    first()
                )
                .subscribe(
                    () => {
                        setDeletedProjects(deletedProjects);
                        updateProjectsStatus({
                            updatedProjects: deletedProjects,
                            status: ProjectStatus.Deleted,
                        });
                        dispatch({ type: Actions.FinishedDelete });
                    },
                    (e) => logger.error(e)
                );
        },
        [dispatch, updateProjectsStatus, setDeletedProjects]
    );

    const resetScan = useCallback(() => {
        finder.current?.destroy();
        dispatch({ type: Actions.Reset });
        if (!folders.current) {
            return;
        }
        startScan(folders.current);
    }, [dispatch, finder.current, folders.current]);

    const pauseScan = useCallback(() => {
        dispatch({ type: Actions.PauseScan });
        finder.current?.pause();
    }, [finder.current, dispatch]);

    const stopScan = useCallback(() => {
        dispatch({ type: Actions.FinishedScan });
        finder.current?.cancel();
    }, [finder.current, dispatch]);

    const resumeScan = useCallback(() => {
        dispatch({ type: Actions.StartScan });
        finder.current?.resume();
    }, [finder.current, dispatch]);

    useEffect(() => {
        const sub = finder.current!.onScanEnd.subscribe(() =>
            dispatch({ type: Actions.FinishedScan })
        );
        return () => sub.unsubscribe();
    }, [finder.current, dispatch]);

    useEffect(() => {
        const sub = finder.current?.foldersScanned$.subscribe((number) =>
            setFoldersScanned(number)
        );
        return () => sub?.unsubscribe();
    }, [finder.current]);

    useEffect(() => {
        const sub = finder.current
            ?.scanDrives()
            .subscribe((drives) => setDrives(drives));
        return () => sub?.unsubscribe();
    }, [finder.current]);

    useEffect(() => {
        const sub = finder.current?.projects$
            .pipe(
                map((projects) =>
                    projects.filter(
                        (project) => project.status !== ProjectStatus.Deleted
                    )
                ),
                tap((projects) => setProjects(projects))
            )
            .subscribe();
        return () => sub?.unsubscribe();
    }, [finder.current]);

    // finder clean up
    useEffect(() => {
        return () => finder.current?.destroy();
    }, []);

    return {
        projects,
        startScan,
        deleteProjects,
        deletedProjects,
        totalSizeString,
        totalSpace,
        foldersScanned,
        pauseScan,
        resumeScan,
        resetScan,
        stopScan,
        state,
        drives,
    };
};
