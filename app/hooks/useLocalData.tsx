import { ProjectData } from '../types/Project';
import { useMemo } from 'react';
import Store from 'electron-store';


interface StoreState {
    projects: ProjectData[]
}

function useLocalData<T>(options?: Store.Options<T>) {
    const store = useMemo(() => {
        return new Store<T>();
    }, []);
    return {
        set: store.set,
    }
}

