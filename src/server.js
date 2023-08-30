const http = require('http');
const app = require('./app');
const { DEFAULT_PORT } = require('./utils/constants');

const server = http.createServer(app);

server.listen(process.env.PORT || DEFAULT_PORT);

server.on('listening', () => {
    const address = server.address();
    if (address) {
        const bind = typeof address === 'string' ? `pipe ${address}` : `port ${address.port}`;
        console.info(`Oroge is listening on ${bind}`);
    } else {
        console.error('Failed to retrieve server address.');
    }
});

server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof DEFAULT_PORT === 'string' ? `Pipe ${DEFAULT_PORT}` : `Port ${DEFAULT_PORT}`;

    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});

process.on('SIGINT', () => {
    console.info('Gracefully shutting down...');
    server.close(() => {
        console.info('Server closed.');
        process.exit(0);
    });
});
