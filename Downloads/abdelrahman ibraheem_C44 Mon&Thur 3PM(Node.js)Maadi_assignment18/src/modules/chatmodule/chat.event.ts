import type { AuthenticatedSocket } from "../getway/getway"
import { chatSoketServices } from "./chat.socket.services"

export class chatEvent{
    private chatSoketServices= new chatSoketServices()
    constructor(){}

    sendMessage=(socket:AuthenticatedSocket)=>{
        socket.on('sendMessage',(data)=>{
            return this.chatSoketServices.sendMessage(socket,data)
        

    })
}
}