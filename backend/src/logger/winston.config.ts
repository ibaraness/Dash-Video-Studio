import * as winston from 'winston';
import 'winston-daily-rotate-file';
require('dotenv').config();

// Create transports instance
const transports = [
    new winston.transports.Console({
        format: winston.format.combine(
          // Add a timestamp to the console logs
          winston.format.timestamp(),
          // Add colors to you logs
          winston.format.colorize(),
          // What the details you need as logs
          winston.format.printf(({ timestamp, level, message, context, trace }) => {
            return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
          }),
        ),
      }),
      new winston.transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
];

// Create and export the logger instance
export const logger = winston.createLogger({
  level: process.env?.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports,
});