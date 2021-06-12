import mongoose, { ConnectOptions } from 'mongoose';
import { config } from '@root/config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('database');

export default () => {
    const connectionOptions: ConnectOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    };

    const connect = () => {
        mongoose
            .connect(`${config.DATABASE_URL}`, connectionOptions)
            .then(() => {
                return log.info('Successfully connected to database.');
            })
            .catch((error) => {
                log.error('Error connecting to database', error);
                return process.exit(1);
            });
    };
    connect();

    mongoose.connection.on('disconnected', connect);
};
