import { Logger } from "@nestjs/common";
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";

import { Server } from "socket.io";

@WebSocketGateway({ cors: true })
export class TranscodeGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly nestlogger = new Logger(TranscodeGateway.name);

    @WebSocketServer() io: Server;

    afterInit() {
        this.nestlogger.log("Initialized");
    }

    handleConnection(client: any, ...args: any[]) {
        const { sockets } = this.io.sockets;

        this.nestlogger.log(`Client id: ${client.id} connected`);
        this.nestlogger.debug(`Number of connected clients: ${sockets.size}`);
    }

    handleDisconnect(client: any) {
        this.nestlogger.log(`Cliend id:${client.id} disconnected`);
    }
}