export enum ProjectStatus {
    Active = 'active',
    Deleted = 'deleted',
    Deleting = 'deleting',
    PendingDelete = 'pending-delete',
    Installing = 'installing',
    Installed = 'installed'
}

export interface ProjectData {
    name: string;
    path: string;
    size: number;
    id: string;
    status: ProjectStatus;
    lastModified: Date | string;
    isYarn: boolean;
    description: string;
}
