import { Logger } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

interface EditingUserInfo {
  penName: string;
  editingId: string | null;
}

@WebSocketGateway(4600, {
  namespace: "bklog"
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger("socket");

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
  }

  @SubscribeMessage('roomjoin')
  handleJoin(client: Socket, roomId: string) {
    client.join(roomId, () => { this.logger.log(`join ${client.id}`) });
  }

  @SubscribeMessage('roomleave')
  handleLeave(client: Socket, roomId: string) {
    client.leave(roomId, () => { this.logger.log(`leave ${client.id}`) });
    client.to(roomId, client.id);
  }
  
  @SubscribeMessage('update')
  handleUpdate(client: Socket, roomId: string) {
    client.to(roomId).emit("update", client.id);
  }

  @SubscribeMessage('updated')
  handleUpdated(client: Socket, data: [string, string]) {
    client.to(data[0]).emit("updated", data[1]);
  }

  @SubscribeMessage('edit')
  handleEditing(client: Socket, data: [string, EditingUserInfo]) {
    client.to(data[0]).emit("editing", data[1]);
  }

  @SubscribeMessage('edited')
  handleEdited(client: Socket, data: [string, string]) {
    client.to(data[0]).emit("edited", data[1]);
  }

}