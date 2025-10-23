import type { Request, Response } from "express";
import { successHandler } from "../../utils/Email/successHandler";
import { NOtFoundexception } from "../../utils/Error";
import { userModel } from "../usermodule/user.model";
import { chatModel } from "./chat.model";
import { Server } from "socket.io";
import { z } from "zod";
import { Types } from "mongoose";
import type { AuthenticatedSocket } from "../getway/getway";
import { populate } from "dotenv";

const io = new Server();
const socket = require("socket.io-client")("http://localhost:4000");
const userId = "user-" + Math.floor(Math.random() * 1000);

export class ChatServices {
  private chatModel = chatModel;
  private userModel = userModel;
  private connectedUsers = new Map<string, string[]>();

  constructor() {}

  getChat = async (req: Request, res: Response): Promise<void> => {
    const userId = Types.ObjectId.createFromHexString(req.params.userId as string);
    const loggedUser = res.locals.user;

    const to = await this.userModel.findOne({
      _id: userId,
      friends: { $in: [loggedUser._id] },
    });

    if (!to) {
      throw new NOtFoundexception("user not found");
    }

    const chat = await this.userModel.findOne({
      participants: { $all: [userId, loggedUser._id] },
      group: { $exists: false },
        options: { populate:'participants'
            , sort: { createdAt: -1 } }
    });

    if (!chat) {
      const newChat = await this.userModel.create({
        participants: [userId, loggedUser._id],
        createdBy: loggedUser._id,
        message: [],
      });

       successHandler({
        res,
        data: newChat,
      });
    }

    successHandler({
      res,
      data: chat,
    });
  };


  socketHandler = (io: Server) => {
    io.on("connection", (socket: AuthenticatedSocket) => {
      const userId = socket.userId?._id.toString();
      if (!userId)
         return;

      const userSockets = this.connectedUsers.get(userId) || [];
      userSockets.push(socket.id);
      this.connectedUsers.set(userId, userSockets);

      console.log("✅ User connected:", userId);
      io.emit("user:online", Array.from(this.connectedUsers.keys())); 

      socket.on("disconnect", () => {
        let userSockets = this.connectedUsers.get(userId) || [];
        userSockets = userSockets.filter((id) => id !== socket.id);
        if (userSockets.length === 0) {
          this.connectedUsers.delete(userId);
          console.log("❌ User disconnected:", userId);
        } else {
          this.connectedUsers.set(userId, userSockets);
        }
        io.emit("user:online", Array.from(this.connectedUsers.keys()));
      });
    });
  };
}


console.log("You are:", userId);

const MessageSchema = z.object({
  userId: z.string(),
  text: z.string().min(1, "Cannot send empty message"),
  
});
console.log(MessageSchema);


socket.on("connect", () => {
  socket.emit("user:online", userId);
});

socket.on("user:online", (users: string[]) => {
  console.log("🟢 Online users:", users);
});

socket.on("user:typing", (data: { userId: string; isTyping: boolean }) => {
  if (data.userId !== userId) {
    console.log(
      data.isTyping
        ? `✍ ${data.userId} is typing...`
        : `${data.userId} stopped typing.`
    );
  }
});


