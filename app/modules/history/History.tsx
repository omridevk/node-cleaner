import React, { useMemo } from 'react';
import { Table } from './Table';
import { defaultColumns } from './columns';

export const History: React.FC<any> = () => {
    const columns = useMemo(() => defaultColumns, []);
    return (
        <Table columns={columns}/>
    )
}