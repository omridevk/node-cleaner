import { exec } from 'child_process';

import getSize from 'get-folder-size';

class InvalidPathError extends Error {
    constructor(message = '') {
        super(message);
        this.name = 'InvalidPathError';
        this.message = message;
    }
}

const check = (cmd: string, coefficient = 1) => {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout) => {
            if (error) {
                reject(error);
            }

            try {
                resolve({ size: parseInt(stdout, 10) * coefficient });
            } catch (error2) {
                reject(error2);
            }
        });
    });
};

export function checkWin32(directoryPath: string) {
    if (directoryPath.charAt(1) !== ':') {
        return new Promise((_, reject) => {
            reject(
                new InvalidPathError(
                    `The following path is invalid (should be X:\\...): ${directoryPath}`
                )
            );
        });
    }
    return new Promise((resolve, reject) => {
        getSize(directoryPath, (err, size) => {
            if (err) {
                reject(err);
            }
            resolve({ size });
        });
    });
}

export const checkUnix = (directoryPath: string) => {
    return check(
        `du -s "${directoryPath}" | cut -f1`,
        1024 // We get sizes in kB, we need to convert that to bytes
    );
};
