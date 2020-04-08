import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';

interface IndeterminateCheckboxProps {
    indeterminate: boolean
}

export const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }: IndeterminateCheckboxProps, ref: any) => {
        const defaultRef = React.useRef();
        const resolvedRef = ref || defaultRef;

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate;
        }, [resolvedRef, indeterminate]);

        return (
            <>
                <Checkbox
                    indeterminate={indeterminate}
                    ref={resolvedRef}
                    {...rest}
                />
            </>
        );
    }
);
