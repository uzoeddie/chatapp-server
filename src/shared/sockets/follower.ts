import { IFollowers } from '@follower/interface/follower.interface';
import { Server, Socket } from 'socket.io';

let socketIOFollowerObject: Server;

export class SocketIOFollowerHandler {
    public listen(io: Server): void {
        socketIOFollowerObject = io;
        io.on('connection', (socket: Socket) => {
            socket.on('unfollow user', (data: IFollowers) => {
                io.emit('remove follower', data);
            });
        });
    }
}

export { socketIOFollowerObject };
