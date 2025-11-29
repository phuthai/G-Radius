const http = require('http');
const fs = require('fs');

const logFile = '/var/log/gradius/healthcheck.log';

function log(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `${timestamp} - ${message}\n`);
}

const options = {
    host: '127.0.0.1',
    port: 5000,
    path: '/health',
    timeout: 2000
};

log('Starting healthcheck...');

const request = http.request(options, (res) => {
    log(`STATUS: ${res.statusCode}`);
    if (res.statusCode === 200) {
        log('Healthcheck passed');
        process.exit(0);
    } else {
        log(`Healthcheck failed with status ${res.statusCode}`);
        process.exit(1);
    }
});

request.on('error', (err) => {
    log(`ERROR: ${err.message}`);
    process.exit(1);
});

request.end();
