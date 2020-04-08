import { filter, map, sample, switchMap, take, tap } from 'rxjs/operators';
import { forkJoin, interval, Subscription } from 'rxjs';
import { Finder } from './finder';
import { Ipc } from './ipc';
import { Messages } from '../enums/messages';
import { ProjectData } from '../types';
import * as R from 'ramda';
import * as electronLog from 'electron-log';
import chalk from 'chalk';

export class DataManager {
    constructor(private finder: Finder, private ipc: Ipc) {}

    public scan() {
        this._subscription = forkJoin([
            this._onDelete,
            this._onUpdateProjects,
            this._onScanEnd,
            this._onCancelScan,
            this._onScanStart,
            this._onPauseScan,
            this._onScanResume,
            this._onScanDrives,
            this._onScanning
        ]).subscribe();
    }

    private _onPauseScan = this.ipc.listen(Messages.PAUSE_SCAN).pipe(
        tap(() => this.finder.pause()),
        switchMap(() => this.ipc.send(Messages.SCAN_IDLE))
    );

    private _onScanResume = this.ipc.listen(Messages.RESUME_SCAN).pipe(
        tap(() => this.finder.resume()),
        tap(() => logger.info('resume scaning')),
        switchMap(() => this.ipc.send(Messages.SCAN_STARTED))
    );

    // source = interval(1000);

    private _onScanning = this.finder.scanning$.pipe(
        sample(interval(500))
        // switchMap(directory =>
        //     // this.ipc.send(Messages.SCANNED_FOLDER, directory)
        // )
    );

    private _onScanDrives = this.ipc.listen(Messages.START_SCAN_DRIVES).pipe(
        switchMap(() => this.finder.scanDrives()),
        switchMap(drives => {
            logger.log(`found the following drives: ${JSON.stringify(drives)}`);
            return this.ipc.send(Messages.FINISHED_SCANNING_DRIVES, drives);
        })
    );

    private _onCancelScan = this.ipc
        .listen(Messages.CANCEL_SCAN)
        .pipe(tap(() => this.finder.cancel()));

    private _onScanEnd = this.finder.onScanEnd.pipe(
        filter(Boolean),
        switchMap(() => this.ipc.send(Messages.FINISHED_SCANNING)),
        tap(() => logger.info('scan completed'))
    );

    private _onUpdateProjects = this.finder.projects$.pipe(
        switchMap(projects => this.ipc.send(Messages.PROJECT_UPDATED, projects))
    );

    private _onScanStart = this.ipc.listen(Messages.START_SCANNING).pipe(
        map(({ data: directories }) => directories),
        tap(directories =>
            logger.info(
                `starting scanning directory "${chalk.redBright(
                    JSON.stringify(directories)
                )}"`
            )
        ),
        tap(directories => this.finder.start(directories)),
        switchMap(() => this.ipc.send(Messages.SCAN_STARTED))
    );

    private _subscription?: Subscription;

    private _onDelete = this.ipc
        .listen<ProjectData[]>(Messages.DELETE_PROJECTS)
        .pipe(
            map(({ data: projects }) => ({
                paths: projects
                    .map(project => `${project.path}/node_modules`)
                    .join('" "'),
                projects
            })),
            tap(({ paths }) => {
                logger.info(`will execute: rm -rf "${paths}"`);
            }),
            // TODO uncomment that when we are ready to actually delete stuff
            // switchMap(({projects, paths}) =>
            //     exec(`rm -rf ${paths}`, {
            //         name: 'Node Cleaner'
            //     }).pipe(
            //         tap(() =>
            //             logger.info(
            //                 chalk.black(
            //                     `removing projects ${chalk.redBright(
            //                         projects.join(" , ")
            //                     )}`
            //                 )
            //             )
            //         ),
            //         catchError(error => {
            //             console.error(
            //                 `error removing projects`,
            //                 chalk.redBright(error.message)
            //             );
            //             return EMPTY;
            //         }),
            //         retry()
            //     )
            // ),
            switchMap(({ projects: deletedProjects }) =>
                this.ipc
                    .send(Messages.PROJECTS_DELETED, deletedProjects)
                    .pipe(map(() => ({ deletedProjects })))
            ),
            switchMap(({ deletedProjects }) =>
                this.finder.projects$.pipe(
                    take(1),
                    map(projects => ({ projects, deletedProjects }))
                )
            ),
            map(({ projects, deletedProjects }) => {
                const comp = (x: ProjectData, y: ProjectData) =>
                    x.path === y.path;
                return R.differenceWith(comp, projects, deletedProjects);
            }),
            tap(projects => this.finder.updateProjects(projects))
        );

    destroy() {
        if (!this._subscription) {
            return;
        }
        this._subscription.unsubscribe();
    }
}

const logger = electronLog.create('data-manager');
