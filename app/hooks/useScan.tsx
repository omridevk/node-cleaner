import { Finder } from '../utils/finder';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ProjectData } from '../types';
import { tap, first } from 'rxjs/operators';
import { Drive } from '../utils/list-drives';
import compose from 'ramda/src/compose';
import sum from 'ramda/src/sum';
import map from 'ramda/src/map';
import prop from 'ramda/src/prop';
import { formatByBytes } from '../utils/helpers';
import rimraf from 'rimraf';
import * as electronLog from 'electron-log';
import path from 'path';
import * as R from 'ramda';
import { bindCallback, forkJoin } from 'rxjs';
import chalk from 'chalk';

const rimraf$ = bindCallback(rimraf);
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
    DeleteProjects,
    FinishedDelete
}

function reducer(state: State, action: any): State {
    switch (action.type) {
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

// const delete = ({projects, paths}) => exec(`rm -rf ${paths}`, {
//     name: 'Node Cleaner'
// }).pipe(
//     tap(() =>
//         logger.info(
//             chalk.yellowBright(
//                 `removing projects ${chalk.redBright(
//                     projects
//                         .map(project => project.name)
//                         .join(' , ')
//                 )}`
//             )
//         )
//     ),
//     catchError(error => {
//         console.error(
//             `error removing projects`,
//             chalk.redBright(error.message)
//         );
//         return EMPTY;
//     }),
//     rxMap(() => ({ projects, paths })),
//     retry()
// )

export const useScan = () => {
    const finder = useRef<Finder>();
    if (!finder.current) {
        finder.current = new Finder();
    }
    const [projects, setProjects] = useState<ProjectData[]>([]);
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
        forkJoin(paths.map(path => rimraf$(path)))
            .pipe(first())
            .subscribe(() => {
                setDeletedProjects(deletedProjects);
                const comp = (x: ProjectData, y: ProjectData) =>
                    x.path === y.path;
                finder.current!.updateProjects(
                    R.differenceWith(comp, projects, deletedProjects)
                );
                dispatch({ type: Actions.FinishedDelete });
            });
    }
    function resetProjects() {
        setProjects([]);
        setDeletedProjects([]);
    }
    function pauseScan() {
        finder.current!.pause();
        dispatch({ type: Actions.PauseScan });
    }
    function stopScan() {
        dispatch({ type: Actions.FinishedScan });
        finder.current!.cancel();
    }
    function resumeScan() {
        dispatch({ type: Actions.StartScan });
        finder.current!.resume();
    }
    useEffect(() => {
        const scanEndSub = finder.current!.onScanEnd.subscribe(() =>
            dispatch({ type: Actions.FinishedScan })
        );
        const scanDriveSub = finder
            .current!.scanDrives()
            .subscribe(drives => setDrives(drives));
        const sub = finder
            .current!.projects$.pipe(tap(projects => setProjects(projects)))
            .subscribe();
        return () => {
            sub.unsubscribe();
            scanEndSub.unsubscribe();
            scanDriveSub.unsubscribe();
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
        pauseScan,
        resumeScan,
        stopScan,
        state,
        drives
    };
};
