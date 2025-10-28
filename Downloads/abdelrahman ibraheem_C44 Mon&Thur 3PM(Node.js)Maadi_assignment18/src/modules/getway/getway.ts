import { Server, Socket } from "socket.io"
import type { Server as httpServer } from 'http'
import type { HydratedDocument } from "mongoose";
import type { IUser } from "../usermodule/user.model";
import { decodeToken, TokenTypesEnum } from "../../middleware/auth.middleware";
import { id } from "zod/v4/locales";


export interface AuthenticatedSocket extends Socket {
  userId?: HydratedDocument<IUser>;
}
  export   const connectedSokets = new Map<string, string[]>();


    export const connect=(socket:AuthenticatedSocket)=>{
     {
  const currentSokets =
    connectedSokets.get(socket.userId?._id?.toString() as string) || [];
  currentSokets.push(socket.id);
  connectedSokets.set(
    socket.userId?._id?.toString() as string,
    currentSokets
  );


};
    }
export const disconect=(socket:AuthenticatedSocket)=>{
  socket.on('disconnect', () => {
    let currentSokets = connectedSokets.get(socket.userId?._id?.toString() as string) || [];
    currentSokets = currentSokets.filter(id => id !== socket.id
    );
    connectedSokets.set(
      socket.userId?._id?.toString() as string,
      currentSokets
    );
  });
}

export const initilize=(httpServer:httpServer)=>{



    const io = new Server(httpServer, {
      cors: {
        origin: "*",
      }
    })

    io.use(async (socket: AuthenticatedSocket, next) => {
  try {
    console.log({ token: socket.handshake.auth.authorization });
    const data = await decodeToken({
      authorization: socket.handshake.auth.authorization,
      tokenType: TokenTypesEnum.access,
    });
    socket.userId = data.user;
    next();
  } catch (error) {
    next(error as Error);
  }
        

});
io .on('connection', (socket: AuthenticatedSocket) => {
      disconect(socket)
            connect(socket)

})



}