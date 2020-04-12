import {
    CANCEL_SCAN,
    PAUSE_SCAN,
    RESTART_SCAN,
    RESUME_SCAN,
    ScanActionTypes,
    ScanState,
    START_SCAN,
    State
} from './types';

const initialState: ScanState = {
    scanState: State.Idle
};

export function scanReducer(
    state = initialState,
    action: ScanActionTypes
): ScanState {
    switch (action.type) {
        case CANCEL_SCAN:
            return {
                scanState: State.Finished
            };
        case RESTART_SCAN:
        case RESUME_SCAN:
        case START_SCAN:
            return {
                scanState: State.Scanning
            };
        case PAUSE_SCAN:
            return {
                scanState: State.Paused
            };
        default:
            return state;
    }
}
