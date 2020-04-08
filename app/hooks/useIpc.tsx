import { useEffect, useMemo, useReducer, useState } from 'react';
import { ipcRenderer } from 'electron';
import { ProjectData } from '../types';
import { Messages } from '../enums/messages';
import { formatByBytes } from '../utils/helpers';
// import * as electronLog from 'electron-log';
// import { map, prop, sum } from 'ramda';
import map from 'ramda/src/map';
import prop from 'ramda/src/prop';
import sum from 'ramda/src/sum';
import compose from 'ramda/src/compose';
import { Drive } from '../utils/list-drives';

// const logger = electronLog.scope('useIpc');

export enum State {
    loading = 'loading',
    finished = 'finished',
    idle = 'idle'
}

interface ReturnType {
    projects: ProjectData[];
    state: State;
    drives: Drive[];
    currentFolder: string;
    resetProjects: () => void;
    totalSizeString: string;
    dispatch: (channel: string, ...args: any[]) => void;
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
export const useIpc = (): ReturnType => {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [drives, setDrives] = useState<Drive[]>([]);
    const [currentFolder, setCurrentFolder] = useState('');
    const [state, dispatch] = useReducer(reducer, State.idle);
    const sumSize = compose(sum, map(prop('size')));
    const totalSizeString = useMemo(() => formatByBytes(sumSize(projects)), [
        projects
    ]);
    const resetProjects = () => {
        setProjects([]);
    };
    const onProjectUpdate = (_: any, newProjects: ProjectData[]) => {
        setProjects(newProjects);
    };
    const onFinishedScanning = (_: any) => {
        dispatch({ type: Actions.Finished });
    };
    const onStartedScanning = () => {
        dispatch({ type: Actions.Start });
    };
    const onScanIdle = () => {
        dispatch({ type: Actions.Pause });
    };
    const onScannedFolder = (_, directory: string) => {
        setCurrentFolder(directory);
    };

    const onScanDrives = (_, drives: string[]) => {
        setDrives(drives);
    };
    console.log(ipcRenderer);
    const onProjectsDeleted = (_: any) => {};
    useEffect(() => {
        // logger.info('starting to listen to IPC');
        ipcRenderer.on(Messages.FINISHED_SCANNING, onFinishedScanning);
        ipcRenderer.on(Messages.SCANNED_FOLDER, onScannedFolder);
        ipcRenderer.on(Messages.SCAN_IDLE, onScanIdle);
        ipcRenderer.on(Messages.FINISHED_SCANNING_DRIVES, onScanDrives);
        ipcRenderer.on(Messages.PROJECT_UPDATED, onProjectsDeleted);
        ipcRenderer.on(Messages.PROJECT_UPDATED, onProjectUpdate);
        ipcRenderer.on(Messages.SCAN_STARTED, onStartedScanning);
        return () => {
            ipcRenderer.off(Messages.FINISHED_SCANNING, onFinishedScanning);
            ipcRenderer.off(Messages.FINISHED_SCANNING_DRIVES, onScanDrives);
            ipcRenderer.off(Messages.SCANNED_FOLDER, onScannedFolder);
            ipcRenderer.off(Messages.SCAN_IDLE, onScanIdle);
            ipcRenderer.off(Messages.PROJECT_UPDATED, onProjectsDeleted);
            ipcRenderer.off(Messages.PROJECT_UPDATED, onProjectUpdate);
            ipcRenderer.off(Messages.SCAN_STARTED, onStartedScanning);
        };
    }, []);
    return {
        projects,
        dispatch: ipcRenderer.send,
        state,
        drives,
        resetProjects,
        currentFolder,
        totalSizeString
    };
};
