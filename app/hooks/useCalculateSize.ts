import { ProjectData } from '../types';
import { useMemo } from 'react';
import { formatByBytes, sumBySize } from '../utils/helpers';

export const useCalculateSize = (projects: ProjectData[]) => {
    return useMemo(() => formatByBytes(sumBySize(projects)), [projects]);
};
