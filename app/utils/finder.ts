import { BehaviorSubject, from, Observable } from 'rxjs';
import { performance } from 'perf_hooks';
import fs from 'fs-extra';
import path from 'path';
import readdirp, { ReaddirpStream } from 'readdirp';
import chalk from 'chalk';
import {
    delay,
    filter,
    map,
    switchMap,
    take,
    takeUntil,
    takeWhile,
    tap,
    throttleTime
} from 'rxjs/operators';
import * as R from 'ramda';
import { without } from 'ramda';
import { ProjectData } from '../types';
import { checkUnix, checkWin32 } from './check-size';
import moment from 'moment';
import { Drive, listDrives } from './list-drives';
import { ignoredFolders } from '../constants/ignoredFolders';
import { ScanState } from '../hooks/useScan';
import { ProjectStatus } from '../types/Project';
import * as log from 'electron-log';
import { unionWith } from 'ramda';
import { eqBy } from 'ramda';
import { prop } from 'ramda';
const logger = log.scope('finder');

const checkSize = process.platform === 'win32' ? checkWin32 : checkUnix;

let walkers = 0;

const getWalker = (dir = '/', paused = true) => {
    walkers++;
    const reader = readdirp(dir, {
        type: 'directories',
        directoryFilter: entry => {
            const dotFolders = /(\/\.\w+)/g.test(entry.fullPath);
            return (
                !dotFolders &&
                !ignoredFolders.some(({ name, fullPath = false }) => {
                    name = `${path.sep}${name}${path.sep}`;
                    if (!fullPath) {
                        return entry.fullPath.includes(name);
                    }
                    return entry.fullPath.indexOf(name) === 0;
                })
            );
        }
    });
    return paused ? reader.pause() : reader;
};

export class Finder {
    private _walkers: ReaddirpStream[] = [];

    private _projects = new BehaviorSubject<ProjectData[]>([]);

    public projects$ = this._projects.asObservable();

    private _foldersScanned = new BehaviorSubject<number>(0);

    public foldersScanned$ = this._foldersScanned
        .asObservable()
        .pipe(throttleTime(300));

    private _scanReset = new BehaviorSubject<boolean>(false);
    private scanReset = this._scanReset.asObservable().pipe(filter(Boolean));

    private _onScanEnd = new BehaviorSubject<boolean>(false);

    public onScanEnd = this._onScanEnd.asObservable().pipe(
        filter(Boolean),
        tap(() => this.logExecutionTime()),
        delay(2500)
    );

    private _startTime = 0;

    public isDestroyed() {
        return this._walkers.some(walker => walker.destroyed);
    }

    constructor() {}

    _state = ScanState.Idle;

    scanDrives(): Observable<Drive[]> {
        return listDrives();
    }

    updateProjects = (projects: ProjectData[]) => {
        this._projects.next(
            unionWith(eqBy(prop('path')), projects, this._projects.getValue())
        );
    };

    logExecutionTime = () => {
        logger.log(
            `took: ${moment
                .duration(performance.now() - this._startTime)
                .seconds()} seconds to scan`
        );
    };

    start = (location: string | string[] = '/') => {
        this._scanReset.next(false);
        this._foldersScanned.next(0);
        const directories = Array.isArray(location) ? location : [location];
        logger.info(`starting to scan ${directories.join(',')}`);

        directories.forEach(directory => {
            this._walkers.push(
                getWalker(directory.replace(/(\s+)/g, '\\$1'), false)
            );
        });
        this._projects.next([]);
        this._startTime = performance.now();
        this._state = ScanState.Loading;
        this._addListeners();
    };

    resume = () => {
        this._scanReset.next(false);
        this._walkers.forEach(walker => walker.resume());
        this._state = ScanState.Loading;
        logger.info(chalk.black.bgYellow.bold(`resume scanning folders`));
    };

    pause = () => {
        this._walkers.forEach(walker => walker.pause());
        this._state = ScanState.Idle;
        logger.info(chalk.black.bgYellow.bold(`paused scanning folders`));
    };

    reset = () => {
        this._foldersScanned.next(0);
        this._scanReset.next(true);
        this._projects.next([]);
        this._state = ScanState.Idle;
    };

    cancel = () => {
        this.reset();
        this.logExecutionTime();
        logger.log(`total walkers used: ${walkers}`);
        this.destroy();
    };

    destroy() {
        if (!this._walkers.length) {
            return;
        }
        walkers = 0;
        this._removeListeners();
        this._projects.next([]);
        this._walkers.forEach(walker => walker.destroy());
        this._walkers = [];
    }

    private _handleOnScanEnd = (toRemove: ReaddirpStream) => () => {
        this._walkers = without([toRemove], this._walkers);
        if (this._walkers.length) {
            return;
        }
        walkers = 0;
        this._state = ScanState.Finished;
        this._onScanEnd.next(true);
    };

    private _addListeners = () => {
        this._walkers.forEach(walker => {
            walker.on('data', this._handleOnScan);
            walker.on('error', e => logger.log(e));
            walker.on('end', this._handleOnScanEnd(walker));
        });
    };

    private _removeListeners = () => {
        this._walkers.forEach(walker => {
            walker.off('data', this._handleOnScan);
            walker.off('end', this.handleScanEnd);
        });
    };
    private handleScanEnd = () => this._onScanEnd.next(true);

    private _handleOnScan = (entry: any) => {
        this._foldersScanned.next(this._foldersScanned.getValue() + 1);
        const stats$ = (entry: any) =>
            from(
                Promise.all([
                    fs.readJSON(
                        `${path.join(entry.fullPath, 'package.json')}`,
                        {
                            throws: false
                        }
                    ),
                    fs.stat(entry.fullPath),
                    checkSize(`${path.join(entry.fullPath, 'node_modules')}`)
                ])
            ).pipe(
                map(([{ name, description }, { mtime }, { size }]) => ({
                    size,
                    name,
                    key: entry.fullPath,
                    status: ProjectStatus.Active,
                    description,
                    lastModified: mtime,
                    path: entry.fullPath
                }))
            );

        from(
            Promise.all([
                fs.pathExists(`${path.join(entry.fullPath, 'package.json')}`),
                fs.pathExists(`${path.join(entry.fullPath, 'node_modules')}`),
                Promise.resolve(entry)
            ])
        )
            .pipe(
                filter(results => R.take(2, results).every(Boolean)),
                switchMap(results => stats$(R.last(results))),
                takeUntil(this.scanReset),
                filter(project => project.name),
                tap(({ name }) =>
                    logger.info(
                        chalk.redBright(
                            `found new project: ${chalk.yellowBright(name)}`
                        )
                    )
                ),
                tap((project: ProjectData) => {
                    this.updateProjects([project]);
                }),
                take(1)
            )
            .subscribe();
    };
}
