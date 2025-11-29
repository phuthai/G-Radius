require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const db = require('./config/database');
const googleAuth = require('./config/google-auth');
const logger = require('./config/logger');

const app = express();
console.log('Starting server...');

// Trust proxy - important for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware - Helmet with enhanced configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Rate limiting - Global
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: { message: 'Too many requests, please try again later.' } },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            userAgent: req.get('user-agent')
        });
        res.status(429).json({
            error: { message: 'Too many requests, please try again later.' }
        });
    }
});

// Rate limiting - Stricter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    skipSuccessfulRequests: true,
    message: { error: { message: 'Too many login attempts, please try again later.' } },
    handler: (req, res) => {
        logger.warn('Auth rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            email: req.body.email
        });
        res.status(429).json({
            error: { message: 'Too many login attempts, please try again later.' }
        });
    }
});

// Apply global rate limiter
app.use(globalLimiter);

// CORS - only allow VPN network
app.use(cors({
    origin: ['http://10.0.0.2', 'http://localhost:3000'],
    credentials: true
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Request logging
app.use((req, res, next) => {
    logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Routes - wrapped in try-catch to identify failures
console.log('Loading routes...');
try {
    console.log('Loading auth limiter...');
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);

    console.log('Loading auth routes...');
    app.use('/api/auth', require('./routes/auth'));

    console.log('Loading users routes...');
    app.use('/api/users', require('./routes/users'));

    console.log('Loading wireguard routes...');
    app.use('/api/wireguard', require('./routes/wireguard'));

    console.log('Loading radius routes...');
    app.use('/api/radius', require('./routes/radius'));

    console.log('Loading analytics routes...');
    app.use('/api/analytics', require('./routes/analytics'));

    console.log('Loading settings routes...');
    app.use('/api/settings', require('./routes/settings'));

    console.log('✅ All routes loaded successfully');
} catch (err) {
    console.error('❌ Failed to load routes:', err);
    logger.error('Route loading failed', { error: err.message, stack: err.stack });
    process.exit(1);
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling
app.use((err, req, res, next) => {
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use((req, res) => {
    logger.warn('Route not found', {
        path: req.path,
        method: req.method,
        ip: req.ip
    });
    res.status(404).json({ error: { message: 'Route not found' } });
});

// Handle uncaught exceptions immediately
process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err.message, stack: err.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', { reason, promise });
    process.exit(1);
});

const PORT = process.env.API_PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all interfaces

let server;

const startServer = async () => {
    try {
        console.log('Starting G-Radius backend...');

        // Connect to database first
        console.log('Attempting database connection...');
        await db.connect();
        console.log('Database connected successfully');

        server = app.listen(PORT, HOST, async () => {
            console.log(`Server listening on ${HOST}:${PORT}`);
            logger.info(`🚀 G-Radius API server running on http://0.0.0.0:${PORT}`);
            logger.info(`🔒 VPN-only access mode enabled`);
            logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🛡️  Security: Rate limiting, helmet, sanitization enabled`);

            // Initialize Google Auth
            try {
                await googleAuth.loadSettings();
                if (googleAuth.isEnabled()) {
                    logger.info(`🔐 Google OAuth authentication enabled`);
                }
            } catch (error) {
                logger.error('Failed to initialize Google Auth', { error: error.message });
            }
        });

        server.on('error', (err) => {
            console.error('Server error:', err);
            logger.error('Server error', { error: err.message, code: err.code });
            if (err.code === 'EADDRINUSE') {
                logger.error(`Port ${PORT} is already in use`);
            }
            process.exit(1);
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        logger.error('Failed to start server', {
            error: err.message,
            stack: err.stack,
            code: err.code
        });
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received, closing server gracefully...`);

    if (server) {
        server.close(async () => {
            logger.info('HTTP server closed');
            try {
                await db.end();
                logger.info('Database connections closed');
                process.exit(0);
            } catch (err) {
                logger.error('Error during shutdown', { error: err.message });
                process.exit(1);
            }
        });
    } else {
        process.exit(0);
    }

    // Force shutdown after 10 seconds
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
