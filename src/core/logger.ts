import { createLogger, format } from 'winston';
import winston = require('winston');
import { Format } from 'logform';
import * as TransportStream from 'winston-transport';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

type TransportType = 'File' | 'Console' | 'Stream';

interface CustomTransport {
  transportType: TransportType;
  transportFormat: Format;
  fileName?: string;
}
type LogLevel = 'emerg' | 'alert' | 'crit' | 'error' | 'warning' | 'notice' | 'info' | 'debug';

const LoggerLevels = {
  levels: {
    emerg: 0,
    alert: 1,
    crit: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7
  },
  colors: {
    emerg: 'bold white redBG',
    alert: 'bold orange',
    crit: 'bold red',
    error: 'red',
    warning: 'yellow',
    notice: 'white',
    info: 'grey',
    debug: 'cyan'
  }
};

class Logger {
  public logger: winston.Logger;
  constructor(level: LogLevel, transports: CustomTransport[]) {
    const loggerTransports = [].concat(
      transports.map(transport => {
        switch (transport.transportType) {
          case 'File':
            if (!existsSync(`logs/${transport.fileName}`)) {
              mkdirSync(`logs/${transport.fileName}`);
            }
            return new winston.transports.File({
              format: transport.transportFormat,
              level,
              filename: join(`logs/${transport.fileName}`, `/${level}.log`)
            });
          case 'Console':
            return new winston.transports.Console({
              format: transport.transportFormat,
              level
            });
        }
      })
    );
    this.logger = createLogger({ transports: loggerTransports, levels: LoggerLevels.levels });
  }

  public addTransport(transport: TransportStream) {
    this.logger.add(transport);
  }
}

const customFormat = ({
  timestamp,
  level,
  message,
  ...args
}: {
  timestamp: string;
  level: string;
  message: string;
}) => {
  try {
    return `${timestamp} ${level}: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`;
  } catch (err) {
    console.error(err);
  }
};
export const logger = new Logger('debug', [
  {
    transportType: 'File',
    transportFormat: format.json(),
    fileName: 'request_logger'
  },
  {
    transportType: 'Console',
    transportFormat: format.combine(
      format.colorize(),
      format.align(),
      format.timestamp(),
      // format.splat(),
      format.prettyPrint(),
      format.printf(customFormat)
    )
  }
]).logger;
