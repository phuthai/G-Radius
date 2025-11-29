const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Ensure log directory exists
const logDir = '/var/log/gradius';
let fileLoggingEnabled = false;

try {
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    fileLoggingEnabled = true;
} catch (error) {
    console.warn('Warning: Could not create log directory, file logging disabled:', error.message);
}

// Build transports array
const transports = [
    // Write all logs to console (always enabled)
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
                ({ level, message, timestamp, ...metadata }) => {
                    let msg = `${timestamp} [${level}]: ${message}`;
                    if (Object.keys(metadata).length > 0) {
                        msg += ` ${JSON.stringify(metadata)}`;
                    }
                    return msg;
                }
            )
        )
    })
];

// Add file transports only if directory is writable
if (fileLoggingEnabled) {
    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );
}

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'gradius-backend' },
    transports,
    exceptionHandlers: fileLoggingEnabled ? [
        new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })
    ] : [],
    rejectionHandlers: fileLoggingEnabled ? [
        new winston.transports.File({ filename: path.join(logDir, 'rejections.log') })
    ] : []
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

module.exports = logger;
