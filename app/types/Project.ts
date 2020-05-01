export enum ProjectStatus {
    Active = 'active',
    Deleted = 'deleted',
    Deleting = 'deleting',
    PendingDelete = 'pending-delete',
    Installing = 'installing'
}

export interface ProjectData {
    name: string;
    path: string;
    size: number;
    status: ProjectStatus;
    lastModified: Date | string;
    isYarn: boolean;
    description: string;
}
