import { APP_LOGS_DIR } from '../../config';
import { format, createLogger, transports, Logger } from 'winston';

export const createHistoryLogger = (roomId: string): Logger => {
  return createLogger({
    level: 'info',
    format: format.combine(
      format.label({ label: roomId }),
      format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
      format.json(),
    ),
    defaultMeta: { roomId: `${roomId}` },
    transports: [
      new transports.File({
        filename: `${APP_LOGS_DIR}/history_${roomId}.log`,
      }),
    ],
  });
};
