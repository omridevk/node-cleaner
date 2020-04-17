import sum from 'ramda/src/sum';
import map from 'ramda/src/map';
import prop from 'ramda/src/prop';
import { compose } from 'ramda';
export const sumBy = (name: string) => compose(sum, map(prop(name)));
export const sumBySize = sumBy('size');

export const formatByBytes = (bytes: number, decimals = 0): string => {
    if (bytes == 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const noop = () => {
};
