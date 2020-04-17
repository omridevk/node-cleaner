import { Observable } from 'rxjs';
import { noop } from './helpers';
import { exec as nodeExec, ExecException } from 'child_process';

/**
 * execute command as sudo (give prompt to the user)
 * @param command
 * @param options
 */
export const exec = (command: string) => {
    return new Observable((observer) => {
        const callback = (
            error: ExecException | null,
            stdout: string,
            stderr: string
        ) => {
            console.log(stdout, stderr, error);
            if (error) {
                observer.error(error);
                return noop;
            }
            console.log('hereddddee');
            observer.next({ stdout, stderr });
            return noop;
        };
        nodeExec(command, callback);
    });
};
