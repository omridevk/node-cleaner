import { Observable } from 'rxjs';
import sudo from 'sudo-prompt';
import { noop } from './helpers';

/**
 * execute command as sudo (give prompt to the user)
 * @param command
 * @param options
 */
export const exec = (
    command: string,
    options: { name?: string; icns?: string } = {}
) => {
    return new Observable(observer => {
        const callback = (error: string, stdout: string, stderr: string) => {
            if (error) {
                observer.error(error);
                return noop;
            }
            observer.next({ stdout, stderr });
            return noop;
        };
        sudo.exec(command, options, callback);
    });
};
