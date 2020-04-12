import {
    CANCEL_SCAN,
    PAUSE_SCAN,
    RESTART_SCAN,
    RESUME_SCAN,
    ScanActionTypes,
    START_SCAN
} from './types';

export function cancelScan(): ScanActionTypes {
    return {
        type: CANCEL_SCAN
    };
}
export function startScan(): ScanActionTypes {
    return {
        type: START_SCAN
    };
}
export function pauseScan(): ScanActionTypes {
    return {
        type: PAUSE_SCAN
    };
}
export function resumeScan(): ScanActionTypes {
    return {
        type: RESUME_SCAN
    };
}
export function restartScan(): ScanActionTypes {
    return {
        type: RESTART_SCAN
    };
}
