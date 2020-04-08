import winston, {Logger as WinstonLogger} from 'winston';
class Logger {

    logger: WinstonLogger;

    constructor() {
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'combined.log' })
            ]
        });
    }
}

export const logger = new Logger().logger;
