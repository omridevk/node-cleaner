import { ProjectData } from '../types';
import { useMemo } from 'react';
import { compose, map, prop, sum } from 'ramda';
import { formatByBytes, sumBySize } from '../utils/helpers';

export const useCalculateSize = (projects: ProjectData[]) => {
    return useMemo(() => formatByBytes(sumBySize(projects)), [projects]);
};
