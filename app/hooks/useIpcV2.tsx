import { Finder } from '../utils/finder';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ProjectData } from '../types';
import { switchMap, tap } from 'rxjs/operators';
import { Drive } from '../utils/list-drives';
import compose from 'ramda/src/compose';
import sum from 'ramda/src/sum';
import map from 'ramda/src/map';
import prop from 'ramda/src/prop';
import { formatByBytes } from '../utils/helpers';

export enum State {
    loading = 'loading',
    finished = 'finished',
    idle = 'idle'
}

enum Actions {
    Start,
    Pause,
    Finished
}

function reducer(_: State, action: any) {
    switch (action.type) {
        case Actions.Start:
            return State.loading;
        case Actions.Pause:
            return State.idle;
        case Actions.Finished:
            return State.finished;
        default:
            throw new Error();
    }
}

export const useIpcV2 = () => {
    const finder = useRef<Finder>(new Finder());
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [drives, setDrives] = useState<Drive[]>([]);
    const [state, dispatch] = useReducer(reducer, State.idle);
    const sumSize = compose(sum, map(prop('size')));
    const totalSizeString = useMemo(() => formatByBytes(sumSize(projects)), [
        projects
    ]);
    function startScan(dir: string | string[]) {
        finder.current.start(dir);
        dispatch({ type: Actions.Start });
    }
    function resetProjects() {
        setProjects([]);
    }
    function pauseScan() {
        finder.current.pause();
        dispatch({ type: Actions.Pause });
    }
    function stopScan() {
        dispatch({ type: Actions.Finished });
        finder.current.destroy();
        setProjects([]);
    }
    function resumeScan() {
        dispatch({ type: Actions.Start });
        finder.current.resume();
    }
    useEffect(() => {
        const scanDriveSub = finder.current
            .scanDrives()
            .subscribe(drives => setDrives(drives));
        const sub = finder.current.projects$
            .pipe(
                tap(projects => setProjects(projects)),
                switchMap(() => finder.current.onScanEnd),
                tap(() => dispatch({ type: Actions.Finished }))
            )
            .subscribe();
        return () => {
            sub.unsubscribe();
            scanDriveSub.unsubscribe();
            finder.current.destroy();
        };
    }, []);

    return {
        projects,
        startScan,
        resetProjects,
        totalSizeString,
        pauseScan,
        resumeScan,
        stopScan,
        state,
        drives
    };
};
