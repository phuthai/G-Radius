// Minimal test server to isolate the issue
console.log('=== TEST 1: Loading dotenv ===');
require('dotenv').config();
console.log('✅ dotenv loaded');

console.log('=== TEST 2: Loading express ===');
const express = require('express');
console.log('✅ express loaded');

console.log('=== TEST 3: Loading logger ===');
const logger = require('./config/logger');
console.log('✅ logger loaded');
logger.info('Logger test');

console.log('=== TEST 4: Loading database ===');
const db = require('./config/database');
console.log('✅ database loaded');

console.log('=== TEST 5: Creating express app ===');
const app = express();
console.log('✅ app created');

console.log('=== TEST 6: Starting server ===');
const server = app.listen(5000, '0.0.0.0', () => {
    console.log('✅ Server started on port 5000');
    logger.info('Server started successfully');
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
});

console.log('=== All tests passed, server should be running ===');
