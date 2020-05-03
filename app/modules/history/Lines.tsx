import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles, Theme } from '@material-ui/core';
import { useTextTruncate } from '../../hooks/useTruncate';

interface Props {
    lines: string[];
    done?: boolean;
}

const useLineStyles = makeStyles((theme: Theme) =>
    createStyles({
        line: {
            '&:hover': {
                backgroundColor: '#444'
            },
            fontFamily: 'Cousine,monospace',
            width: '100%'
        },
        number: {
            padding: '1em',
            color: '#666'
        }
    })
);
const useLinesStyles = makeStyles((theme: Theme) =>
    createStyles({
        lines: {
            padding: '1em 0',
            fontFamily: 'Cousine,monospace',
            backgroundColor: '#222',
            width: '100%',
            minHeight: '40px',
            overflow: 'scroll'
        }
    })
);

const Line: React.FC<{ line: string; number: number }> = ({ line, number }) => {
    const classes = useLineStyles();
    const { text } = useTextTruncate(line, {length: 100});
    return (
        <div className={classes.line}>
            <span className={classes.number}>{number}</span>
            {text}
        </div>
    );
};

export const Lines: React.FC<Props> = ({ lines, done = false }) => {
    const classes = useLinesStyles();
    return (
        <div className={classes.lines}>
            {lines.map((line, index) => (
                <Line line={line} key={index} number={index + 1} />
            ))}
        </div>
    );
};
