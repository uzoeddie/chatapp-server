import { IFollowers } from '@follower/interface/follower.interface';
import { Server, Socket } from 'socket.io';

let socketIOFollowerObject: Server;

export class SocketIOFollowerHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOFollowerObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('unfollow user', (data: IFollowers) => {
        this.io.emit('remove follower', data);
      });
    });
  }
}

export { socketIOFollowerObject };
