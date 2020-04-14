import { ProjectData } from '../types';
import { useMemo } from 'react';
import { compose, map, prop, sum } from 'ramda';
import { formatByBytes, sumSize } from '../utils/helpers';

export const useCalculateSize = (projects: ProjectData[]) => {
    return useMemo(() => formatByBytes(sumSize(projects)), [projects]);
};
