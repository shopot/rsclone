import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const enum LoggingLevels {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
}

const isDevelopmentMode =
  (process.env.NODE_ENV || 'production') !== 'production' ? true : false;

const appLoggerConfig: {
  level: LoggingLevels;
  transports: (
    | winston.transports.FileTransportInstance
    | winston.transports.ConsoleTransportInstance
  )[];
} = {
  level: LoggingLevels.Info,
  transports: [
    new winston.transports.File({
      level: LoggingLevels.Error,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
      ),
      filename: `${__dirname}/../logs/error.log`,
    }),
    new winston.transports.File({
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
      ),
      filename: `${__dirname}/../logs/combined.log`,
    }),
  ],
};

if (isDevelopmentMode) {
  appLoggerConfig.transports.push(
    new winston.transports.Console({
      level: LoggingLevels.Debug,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'DD.MM.YYYY HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.prettyPrint(),
        winston.format.splat(),
        winston.format.simple(),
        winston.format.printf((info) => {
          if (info.message.constructor === Object) {
            info.message = JSON.stringify(info.message, null, 4);
          }
          return `${info.timestamp} ${info.level}: ${info.message}`;
        }),
      ),
    }),
  );
}

export default appLoggerConfig;
