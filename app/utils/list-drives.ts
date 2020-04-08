import { exec } from 'child_process';
import head from 'ramda/src/head';
import electronLog from 'electron-log';
const logger = electronLog.create('get-drives');
import { list } from 'drivelist';
import { EMPTY, from, Observable } from 'rxjs';
import { isDarwin, isLinux, isWin } from '../constants';
import { map, tap } from 'rxjs/operators';

export interface Drive {
    name: string | null;
    path: string;
}

const list$ = from(list());

if (isLinux) {
    // TODO:: implement
}
const listDarwin$ = list$.pipe(
    map(drives => {
        return drives
            .filter(drive => drive.mountpoints.length)
            .map(drive => head(drive.mountpoints))
            .map(({ path, label }) => ({ path, name: label }));
    }),
    tap(drives =>
        logger.info(
            `found the following drives: ${JSON.stringify(
                drives.map(({ name }) => name)
            )}`
        )
    )
);

const createListForWindows = (): Observable<Drive[]> => {
    return new Observable(observer => {
        exec('wmic logicaldisk get size,freespace,caption', (error, stdout) => {
            if (error) {
                logger.error(error.message);
                observer.error(error);
            }

            try {
                const drives = stdout
                    .trim()
                    .split('\n')
                    .slice(1)
                    .map(line => {
                        return line.trim().split(/\s+(?=[\d/])/);
                    })
                    .map(drivesInfo => head(drivesInfo))
                    .map(drivesInfo => `${drivesInfo}\/`)
                    .map(driveInfo => ({ path: driveInfo, name: driveInfo }));
                logger.debug(
                    `found the following drives: ${JSON.stringify(drives)}`
                );
                observer.next(drives);
            } catch (error2) {
                observer.error(error2);
            }
        });
    });
};

export const listDrives = (): Observable<Drive[]> => {
    if (isDarwin) {
        return listDarwin$;
    }
    if (isWin) {
        return createListForWindows();
    }
    if (isLinux) {
        // TODO::
    }
    return EMPTY;
};
