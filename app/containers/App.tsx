import React, { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    className: string
};

export default function App(props: Props) {
    const { children, className } = props;
    return <div className={className}>{children}</div>;
}
