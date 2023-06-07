import mongoose from 'mongoose';
import app from './app';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { setupSocket } from './utils/socket.helper';

import { APP_PORT, DB, DB_URI, IS_TEST } from './config/config';
import logger from './config/logger.config';

let dbURI: string;
if (DB.HOST && DB.NAME && DB.PASSWORD && DB.USER) {
  dbURI = `mongodb://${DB.USER}:${encodeURIComponent(DB.PASSWORD)}@${DB.HOST}:${
    DB.PORT
  }/${DB.NAME}`;
} else {
  dbURI = DB_URI;
}

logger.info('connecting to database...');

mongoose
  .connect(dbURI)
  .then(async () => {
    logger.info('Mongoose connection done');
    const http = createServer(app);
    const io = new Server(http, {
      pingTimeout: 10000, // 10 seconds
      pingInterval: 20000, // 20 seconds
      cookie: true,
      // allowEIO3: true,
      transports: ['websocket'],
      cors: {
        origin: ['http://localhost:3000', 'http://localhost:9000'],
        methods: ['GET', 'POST'],
      },
    });
    setupSocket(io);

    http.listen(APP_PORT, () => {
      logger.info(`server listening on ${APP_PORT}`);
    });
  })
  .catch((e) => {
    logger.info('Mongoose connection error');
    logger.error(e);
  });

// CONNECTION EVENTS

// When successfully connected
mongoose.connection.on('connected', () => {
  logger.debug('Mongoose default connection open');
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  logger.error('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection (ctrl + c)
process.on('SIGINT', () => {
  mongoose.connection.close().then(() => {
    logger.info(
      'Mongoose default connection disconnected through app termination'
    );
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception: ' + err);
});
