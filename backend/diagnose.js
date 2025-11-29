// Diagnostic script to identify startup issues
console.log('=== DIAGNOSTIC START ===');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('Current directory:', process.cwd());

// Test 1: Check environment variables
console.log('\n=== ENV VARS ===');
console.log('MYSQL_IP:', process.env.MYSQL_IP);
console.log('MYSQL_PORT:', process.env.MYSQL_PORT);
console.log('MYSQL_USER:', process.env.MYSQL_USER);
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
console.log('API_PORT:', process.env.API_PORT);

// Test 2: Try to load logger
console.log('\n=== LOADING LOGGER ===');
try {
    const logger = require('./config/logger');
    console.log('✅ Logger loaded successfully');
    logger.info('Logger test message');
} catch (err) {
    console.error('❌ Logger failed:', err.message);
    process.exit(1);
}

// Test 3: Try to create database pool
console.log('\n=== LOADING DATABASE ===');
try {
    const db = require('./config/database');
    console.log('✅ Database module loaded');
} catch (err) {
    console.error('❌ Database module failed:', err.message);
    console.error(err.stack);
    process.exit(1);
}

// Test 4: Try to connect to database
console.log('\n=== CONNECTING TO DATABASE ===');
const db = require('./config/database');
const logger = require('./config/logger');

db.connect()
    .then(() => {
        console.log('✅ Database connected successfully');
        logger.info('Database connection test passed');

        // Test 5: Try to load Express app
        console.log('\n=== LOADING EXPRESS APP ===');
        try {
            require('./server');
            console.log('✅ Server loaded successfully');
        } catch (err) {
            console.error('❌ Server failed:', err.message);
            console.error(err.stack);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    });
