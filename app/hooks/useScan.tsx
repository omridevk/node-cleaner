import { Finder } from '../utils/finder';
import {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState
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
    difference,
    differenceWith,
    eqBy,
    filter,
    isEmpty,
    prop,
    propEq,
    unionWith,
    uniq,
    uniqWith
} from 'ramda';

const STORE_NAME = 'deleted';

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
    drives: Drive[];
    folders: string[];
}

enum Actions {
    StartScan,
    PauseScan,
    FinishedScan,
    SetDrives,
    SetFolders,
    Reset,
    DeleteProjects,
    FinishedDelete
}

function reducer(
    state: State,
    action: { type: Actions; payload?: any }
): State {
    switch (action.type) {
        case Actions.Reset:
            return {
                ...state,
                folders: [],
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
        case Actions.SetFolders: {
            const { folders } = action.payload;
            return {
                ...state,
                folders
            };
        }
        case Actions.DeleteProjects:
            return {
                ...state,
                deleting: DeleteState.Deleting
            };
        case Actions.SetDrives: {
            const { drives } = action.payload;
            return {
                ...state,
                drives
            };
        }
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

export const useScan = (
    finder: Finder,
    electronStore: ElectronStore<{ deleted: ProjectData[] }>
) => {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [cleanedProjects, setCleanedProjects] = useState(() =>
        electronStore.get(STORE_NAME)
    );
    const [foldersScanned, setFoldersScanned] = useState(0);
    const [totalSpace, setTotalSpace] = useState({ free: '', size: '' });
    const folders = useRef<string | string[]>();
    const [state, dispatch] = useReducer(reducer, {
        scanning: ScanState.Idle,
        deleting: DeleteState.Idle,
        drives: [],
        folders: []
    });
    const setFolders = useCallback((folders: string[]) => {
        dispatch({ type: Actions.SetFolders, payload: { folders } });
    }, []);
    const setDrives = useCallback((drives: Drive[]) => {
        dispatch({ type: Actions.SetDrives, payload: { drives } });
    }, []);
    const isDeleted = propEq('status', ProjectStatus.Deleted);
    const isInstalled = propEq('status', ProjectStatus.Installed);
    const deletedProjects = useMemo(() => filter(isDeleted, projects), [
        projects
    ]);
    const installedProjects = useMemo(() => filter(isInstalled, projects), [
        projects
    ]);

    useEffect(() => {
        if (!folders.current) {
            return;
        }
        let dirs = Array.isArray(folders.current)
            ? folders.current
            : [folders.current];
        dirs = uniq(dirs.map(dir => path.parse(dir).root));
        const calculateFreeSpace = compose(formatByBytes, sumBy('free'));
        const calculateSize = compose(formatByBytes, sumBy('size'));
        Promise.all(dirs.map(dir => checkDiskSpace(dir))).then(
            (sizes: CheckDiskSpaceResult[]) => {
                setTotalSpace({
                    free: calculateFreeSpace(sizes),
                    size: calculateSize(sizes)
                });
            }
        );
    }, [folders.current]);

    const totalSizeString = useCalculateSize(projects);
    const fetchLocalData = useCallback(() => {
        // finder.cancel();
        let projects = electronStore.get(STORE_NAME, []);
        Promise.all(
            projects.map(project =>
                fs
                    .pathExists(`${project.path}${path.sep}node_modules`)
                    .then((result) => {
                        if (!result) {
                            return Promise.resolve(project);
                        }
                        return Promise.resolve(false);
                    })
            )
        ).then(results => {
            const projects = results.filter(Boolean);
            console.log(projects);
            setCleanedProjects(projects);
            electronStore.set('deleted', projects);
        });
    }, []);
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
            status
        }: {
            updatedProjects: ProjectData[];
            status: ProjectStatus;
        }) => {
            updatedProjects = updatedProjects.map(project => ({
                ...project,
                status: status
            }));

            setProjects(projects =>
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
                status: ProjectStatus.Deleting
            });
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
                        updateProjectsStatus({
                            updatedProjects: deletedProjects,
                            status: ProjectStatus.Deleted
                        });
                        dispatch({ type: Actions.FinishedDelete });
                    },
                    e => logger.error(e)
                );
        },
        [dispatch, updateProjectsStatus]
    );
    useEffect(() => {
        const history = electronStore.get('deleted', []);
        const comp = (x, y) => x.path === y.path;
        electronStore.set(
            'deleted',
            differenceWith(comp, history, installedProjects)
        );
    }, [installedProjects]);
    useEffect(() => {
        if (isEmpty(deletedProjects)) {
            return;
        }
        const history = electronStore.get(STORE_NAME, []);
        console.log('here');
        electronStore.set(
            STORE_NAME,
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
    }, [finder, folders.current]);

    const pauseScan = useCallback(() => {
        dispatch({ type: Actions.PauseScan });
        finder.pause();
    }, [finder]);

    const stopScan = useCallback(() => {
        dispatch({ type: Actions.FinishedScan });
        finder.cancel();
    }, [finder]);

    const resumeScan = useCallback(() => {
        dispatch({ type: Actions.StartScan });
        finder.resume();
    }, [finder]);

    useEffect(() => {
        const sub = finder.onScanEnd.subscribe(() =>
            dispatch({ type: Actions.FinishedScan })
        );
        return () => sub.unsubscribe();
    }, [finder]);

    useEffect(() => {
        const sub = finder.foldersScanned$.subscribe(number =>
            setFoldersScanned(number)
        );
        return () => sub?.unsubscribe();
    }, [finder]);
    useEffect(() => {
        const sub = finder.project$.subscribe(project =>
            setProjects(projects => [...projects, project])
        );
        return () => sub?.unsubscribe();
    }, [finder]);

    useEffect(() => {
        const sub = finder?.scanDrives().subscribe(drives => setDrives(drives));
        return () => sub?.unsubscribe();
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
        setDrives,
        setFolders,
        totalSpace,
        cleanedProjects,
        foldersScanned,
        pauseScan,
        resumeScan,
        resetScan,
        stopScan,
        state
    };
};
