export enum ProjectStatus {
    Active = 'active',
    Deleted = 'deleted',
    Deleting = 'deleting',
    PendingDelete = 'pending-delete'
}

export interface ProjectData {
    name: string;
    path: string;
    size: number;
    status: ProjectStatus;
    lastModified: Date | string;
    description: string;
}
