import { ProjectData } from '../types';
import { useMemo } from 'react';
import { compose, map, prop, sum } from 'ramda';
import { formatByBytes } from '../utils/helpers';

export const useCalculateSize = (projects: ProjectData[]) => {
    const sumSize = compose(sum, map(prop('size')));
    return useMemo(() => formatByBytes(sumSize(projects)), [projects]);
};
