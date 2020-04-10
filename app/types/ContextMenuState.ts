import { ProjectData } from './Project';

export interface ContextMenuState {
    project: ProjectData | null;
    mouseX: null | number;
    mouseY: null | number;
}
