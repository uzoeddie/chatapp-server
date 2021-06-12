import { ILogin, ISocketData } from '@user/interfaces/user.interface';
import { Server, Socket } from 'socket.io';

export const connectedUsersMap: Map<string, string> = new Map();
let socketIOUserObject: Server;

export class SocketIOUserHandler {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        socketIOUserObject = io;
    }

    public listen(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.on('setup', (data: ILogin) => {
                this.addClientToMap(data.userId, socket.id);
            });

            socket.on('block user', (data: ISocketData) => {
                this.io.emit('blocked user id', data);
            });

            socket.on('unblock user', (data: ISocketData) => {
                this.io.emit('unblocked user id', data);
            });

            socket.on('disconnect', () => {
                this.removeClientFromMap(socket.id);
            });
        });
    }

    private addClientToMap(userId: string, socketId: string): void {
        if (!connectedUsersMap.has(userId)) {
            connectedUsersMap.set(userId, socketId);
        }
        this.io.emit('user online', [...connectedUsersMap.keys()]);
    }

    private removeClientFromMap(socketId: string): void {
        if (Array.from(connectedUsersMap.values()).includes(socketId)) {
            const disconnectedUser: [string, string] = [...connectedUsersMap].find((user: [string, string]) => {
                return user[1] === socketId;
            }) as [string, string];
            connectedUsersMap.delete(disconnectedUser[0]);
            this.io.emit('user online', [...connectedUsersMap.keys()]);
        }
    }
}

export { socketIOUserObject };
