import { routes } from '../../constants';
import { createStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(() =>
    createStyles({
        extendedFab: {
            width: '100%',
            height: '0',
            padding: '50% 0',
            overflow: 'hidden',
            borderRadius: '50%',
            boxShadow: '0 0 3px gray',
            background:
                'linear-gradient(to right, rgb(255, 216, 155), rgb(25, 84, 123))',
            border: 'solid 2px #efefef'
        },
        fabText: {
            textAlign: 'center',
            lineHeight: '0.5rem'
        },
        roundButton: {
            minWidth: '100%'
        },
        link: {
            minWidth: '25%',
            textDecoration: 'none'
        },
        container: {
            minWidth: '200px'
        }
    })
);

interface Props {
    directories: string[];
    disabled: boolean;
}
//
// export const ScanButton = ({ directories, disabled = false }: Props) => {
//     const classes = useStyles();
//     return (
//         <Button disabled={disabled}>
//             <Link
//                 aria-disabled={disabled ? 'true' : 'false'}
//                 to={{
//                     pathname: routes.PROJECTS,
//                     state: {
//                         directories
//                     }
//                 }}
//                 className={classes.link}
//             >
//                 <div className={classes.roundButton}>
//                     <Fab
//                         className={classes.extendedFab}
//                         color="primary"
//                         size="large"
//                         aria-label="add"
//                     >
//                         <Typography className={classes.fabText} variant="h2">
//                             Scan
//                         </Typography>
//                     </Fab>
//                 </div>
//             </Link>
//         </Button>
//     );
// };

export const ScanButton = ({ directories, disabled = false }: Props) => {
    const classes = useStyles();
    return (
        <div className={classes.container}>
            <Link
                aria-disabled={disabled ? 'true' : 'false'}
                to={{
                    pathname: routes.PROJECTS,
                    state: {
                        directories
                    }
                }}
                className={classes.link}
            >
                <Button disabled={disabled} className={classes.extendedFab}>
                    <Typography className={classes.fabText} variant="h4">
                        Scan
                    </Typography>
                </Button>
            </Link>
        </div>
    );
};
