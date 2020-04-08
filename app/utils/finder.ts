import { BehaviorSubject, from, Observable } from 'rxjs';
import { performance } from 'perf_hooks';
import fs from 'fs-extra';
import path from 'path';
import readdirp, { ReaddirpStream } from 'readdirp';
import chalk from 'chalk';
import { delay, filter, map, switchMap, take, tap } from 'rxjs/operators';
import * as R from 'ramda';
import { ProjectData } from '../types';
import { checkUnix, checkWin32 } from './check-size';
import * as electronLog from 'electron-log';
import moment from 'moment';
import { Drive, listDrives } from './list-drives';
import { without } from 'ramda';
import { ignoredFolders } from '../constants/ignoredFolders';
const logger = electronLog.create('finder');
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

    private _scanning = new BehaviorSubject<string>('');

    public scanning$ = this._scanning.asObservable();

    private _onScanEnd = new BehaviorSubject<boolean>(false);

    public onScanEnd = this._onScanEnd.asObservable().pipe(
        filter(Boolean),
        tap(_ => this.logExecutionTime()),
        delay(2500)
    );

    private _startTime = 0;

    constructor() {}

    scanDrives(): Observable<Drive[]> {
        return listDrives();
    }

    updateProjects = (projects: ProjectData[]) => {
        this._projects.next(projects);
    };

    logExecutionTime = () => {
        logger.log(
            `took: ${moment
                .duration(performance.now() - this._startTime)
                .seconds()} seconds to scan`
        );
    };

    start = (location: string | string[] = '/') => {
        const directories = Array.isArray(location) ? location : [location];

        directories.forEach(directory => {
            this._walkers.push(
                getWalker(directory.replace(/(\s+)/g, '\\$1'), false)
            );
        });
        this._projects.next([]);
        this._startTime = performance.now();
        this._addListeners();
    };

    resume = () => {
        this._walkers.forEach(walker => walker.resume());
        logger.info(chalk.black.bgYellow.bold(`paused scanning folders`));
    };

    pause = () => {
        this._walkers.forEach(walker => walker.pause());
        logger.info(chalk.black.bgYellow.bold(`paused scanning folders`));
    };

    reset = () => {
        this._projects.next([]);
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
        this._removeListeners();
        this._walkers.forEach(walker => walker.destroy());
    }

    private _handleOnScanEnd = (toRemove: ReaddirpStream) => () => {
        this._walkers = without([toRemove], this._walkers);
        if (this._walkers.length) {
            return;
        }
        this._onScanEnd.next(true);
    };

    private _addListeners = () => {
        this._walkers.forEach(walker => {
            walker.on('data', this._handleOnScan);
            walker.on('error', e => console.log(e));
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
        this._scanning.next(entry.fullPath);
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
                filter(project => project.name),
                tap(({ name }) =>
                    logger.info(
                        chalk.redBright(
                            `found new project: ${chalk.yellowBright(name)}`
                        )
                    )
                ),
                tap((project: any) => {
                    this._projects.next([
                        ...this._projects.getValue(),
                        project
                    ]);
                }),
                take(1)
            )
            .subscribe();
    };
}
