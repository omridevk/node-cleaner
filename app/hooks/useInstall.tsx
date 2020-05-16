import { useState } from 'react';
import { ProjectData } from '../types';
import { spawn } from 'child_process';
import * as log from 'electron-log';
const logger = log.scope('use-install');

export const useInstall = () => {
    const [installData, setData] = useState<
        Map<string, { lines: string[]; done: boolean }>
    >(new Map());
    function install(project: ProjectData) {
        const manager = project.isYarn ? 'yarn' : 'npm';
        let lines: string[] = [];
        function handleData(data: any) {
            lines = [...lines, data.toString()];
            setData(
                data => new Map(data.set(project.id, { lines, done: false }))
            );
        }
        logger.info(`executing command: ${manager} install`);
        const install = spawn(`${manager}`, project.isYarn ? [] : ['install'], {
            cwd: project.path,
            shell: true
        });
        install.stdout.on('data', handleData);
        install.stderr.on('data', handleData);
        install.on('exit', (code) => {
            setData(
                data => new Map(data.set(project.id, { lines, done: true }))
            );
        });
        // install.stderr.on('close', () => {
        //     // console.log("close", {code});
        //     setData(
        //         data => new Map(data.set(project.id, { lines, done: true }))
        //     );
        // });
    }
    // process.stdout.on('data', (data) => {
    // })
    return {
        install,
        installData
    };
};
