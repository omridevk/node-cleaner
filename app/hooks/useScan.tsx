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
import { EMPTY, forkJoin, from } from 'rxjs';
import chalk from 'chalk';
import { ProjectStatus } from '../types/Project';
import fs from 'fs-extra';
import { useCalculateSize } from './useCalculateSize';
import * as logger from 'electron-log';
import { formatByBytes, sumBy } from '../utils/helpers';
import checkDiskSpace, { CheckDiskSpaceResult } from 'check-disk-space';
import ElectronStore from 'electron-store';
import {
    compose,
    differenceWith,
    eqBy,
    filter, isEmpty,
    prop,
    propEq,
    unionWith,
    uniq,
    uniqWith
} from 'ramda';
import { subscribeToResult } from 'rxjs/internal-compatibility';

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

export const useScan = (finder: Finder, electronStore: ElectronStore<{"deleted": ProjectData[]}>) => {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [foldersScanned, setFoldersScanned] = useState(0);
    const [totalSpace, setTotalSpace] = useState({ free: '', size: '' });
    const folders = useRef<string | string[]>();
    const [drives, setDrives] = useState<Drive[]>([]);
    const [state, dispatch] = useReducer(reducer, {
        scanning: ScanState.Idle,
        deleting: DeleteState.Idle,
    });
    const isDeleted = propEq('status', ProjectStatus.Deleted);
    const deletedProjects = useMemo(() => filter(isDeleted, projects), [
        projects,
    ]);

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
    const fetchLocalData = useCallback(() => {
        finder.cancel();
        setProjects(electronStore.get('deleted', []));
    },  []);
    const startScan = useCallback(
        (dir: string | string[]) => {
            finder.start(dir);
            setProjects([]);
            folders.current = dir;
            dispatch({ type: Actions.StartScan });
        },
        [finder, dispatch]
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

            setProjects((projects) =>
                unionWith(eqBy(prop('path')), updatedProjects, projects)
            );
        },
        [finder]
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
            forkJoin(
                demoMode
                    ? from([0]).pipe(delay(5000))
                    : paths.map((path) =>
                          from(fs.remove(path)).pipe(
                              catchError((e) => {
                                  console.error(e);
                                  return EMPTY;
                              })
                          )
                      )
            )
                .pipe(first())
                .subscribe(
                    () => {
                        updateProjectsStatus({
                            updatedProjects: deletedProjects,
                            status: ProjectStatus.Deleted,
                        });
                        dispatch({ type: Actions.FinishedDelete });
                    },
                    (e) => logger.error(e)
                );
        },
        [dispatch, updateProjectsStatus]
    );
    useEffect(() => {
        electronStore.openInEditor();
    }, []);
    useEffect(() => {
        if (isEmpty(deletedProjects)) {
            return;
        }
        const history = electronStore.get('deleted', []);
        electronStore.set(
            'deleted',
            uniqWith(eqBy(prop('path')), [...history, ...deletedProjects])
        );

    }, [deletedProjects]);

    const resetScan = useCallback(() => {
        finder.destroy();
        dispatch({ type: Actions.Reset });
        if (!folders.current) {
            return;
        }
        startScan(folders.current);
    }, [dispatch, finder, folders.current]);

    const pauseScan = useCallback(() => {
        dispatch({ type: Actions.PauseScan });
        finder.pause();
    }, [finder, dispatch]);

    const stopScan = useCallback(() => {
        dispatch({ type: Actions.FinishedScan });
        finder.cancel();
    }, [finder, dispatch]);

    const resumeScan = useCallback(() => {
        dispatch({ type: Actions.StartScan });
        finder.resume();
    }, [finder, dispatch]);

    useEffect(() => {
        const sub = finder.onScanEnd.subscribe(() =>
            dispatch({ type: Actions.FinishedScan })
        );
        return () => sub.unsubscribe();
    }, [finder, dispatch]);

    useEffect(() => {
        const sub = finder.foldersScanned$.subscribe((number) =>
            setFoldersScanned(number)
        );
        return () => sub?.unsubscribe();
    }, [finder]);

    useEffect(() => {
        const sub = finder
            ?.scanDrives()
            .subscribe((drives) => setDrives(drives));
        return () => sub?.unsubscribe();
    }, [finder]);

    useEffect(() => {
        const sub = finder.project$.subscribe((project) => {
            setProjects((projects) =>
                uniqWith(propEq('path'), [...projects, project])
            );
        });
        return () => sub!.unsubscribe();
    }, [finder]);

    // finder clean up
    useEffect(() => {
        return () => finder.destroy();
    }, []);

    return {
        projects,
        startScan,
        deleteProjects,
        updateProjectsStatus,
        totalSizeString,
        fetchLocalData,
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
