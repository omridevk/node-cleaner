import { Observable } from 'rxjs';
import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import { Messages } from '../enums/messages';

/**
 * Internal process communication between
 * render thread and main thread.
 */
export class Ipc {
    constructor(private window: BrowserWindow) {}

    /**
     * send message to the main renderer process.
     * @param action
     * @param data
     */
    send(action: Messages, data?: any): Observable<void> {
        return new Observable(observer => {
            this.window.webContents.send(action, data);
            observer.next();
        });
    }

    /**
     * listen for messages from the renderer.
     * can use the event to reply back to main process
     * @param message
     */
    listen<T = any>(
        message: Messages
    ): Observable<{ event: IpcMainEvent; data: T }> {
        return new Observable(observer => {
            const callback = (event: IpcMainEvent, data: T) => {
                observer.next({ event, data });
            };
            ipcMain.on(message, callback);
            return () => ipcMain.off(message, callback);
        });
    }
}
