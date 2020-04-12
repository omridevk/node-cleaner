export enum State {
    Scanning = 'scanning',
    Idle = 'idle',
    Paused = 'paused',
    Finished = 'finished'
}

export interface ScanState {
    scanState: State;
}

export const START_SCAN = 'START_SCAN';
export const PAUSE_SCAN = 'PAUSE_SCAN';
export const CANCEL_SCAN = 'CANCEL_SCAN';
export const RESUME_SCAN = 'RESUME_SCAN';
export const RESTART_SCAN = 'RESTART_SCAN';

interface StartScanAction {
    type: typeof START_SCAN;
}
interface PauseScanAction {
    type: typeof PAUSE_SCAN;
}
interface ResumeScanAction {
    type: typeof RESUME_SCAN;
}
interface CancelScanAction {
    type: typeof CANCEL_SCAN;
}
interface RestartScanAction {
    type: typeof RESTART_SCAN;
}

export type ScanActionTypes =
    | StartScanAction
    | PauseScanAction
    | ResumeScanAction
    | CancelScanAction
    | RestartScanAction;
