import { Socket } from "socket.io";
import type { AuthenticatedSocket } from "../getway/getway";
import { chatSoketServices } from "./chat.socket.services";

export class chatGetway {
  private chatEvent = new chatSoketServices();

  constructor() {}

  register = (socket: AuthenticatedSocket) => {
    socket.on('sendMessage,sendGroupMessage', (data: { sendTo: string; content: string }) => {
      this.chatEvent.sendMessage(socket, data);
      this.chatEvent.joinRoom(socket,)
    });

    socket.on('sendGroupMessage', (data: { groupId: string; content: string }) => {
      this.chatEvent.sendGroupMessage(socket, data);
    });
  };
}
