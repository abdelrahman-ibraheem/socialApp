import { NOtFoundexception } from "../../utils/Error";
import type { AuthenticatedSocket } from "../getway/getway";
import { userModel } from "../usermodule/user.model";
import { connectedSokets } from "../getway/getway";
import { chatModel } from "./chat.model";

export class chatSoketServices {
  private userModel = userModel;
  private chatModel = chatModel;

  constructor() {}

  sendMessage = async (
    socket: AuthenticatedSocket,
    data: { sendTo: string; content: string }
  ) => {
    try {
      const createdBy = socket.userId?._id;

      const to = await this.userModel.findById(data.sendTo);
      if (!to) {
        throw new Error("user not found");
      }

      const chat = await this.userModel.findOne({
        participants: { $all: [createdBy, to._id] },
        group: { $exists: false },
      });

      if (!chat) {
        throw new NOtFoundexception("chat not found");
      }
      await chat.updateOne({
        $push: {
            message: {
                createdBy,
                content: data.content,
              
            }

        },
      })
        socket.emit("success message", data.content)
socket.to(connectedSokets.get(to._id.toString()) || []).emit("new message", data.content);

    } catch (error) {
      socket.emit("customError", error);
    }
  };
}
