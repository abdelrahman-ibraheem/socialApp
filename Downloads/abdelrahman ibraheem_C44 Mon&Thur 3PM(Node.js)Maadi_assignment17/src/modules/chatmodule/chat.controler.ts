import { Router } from "express";
import { ChatServices } from "./chat.rest.services";
import { auth } from "../../middleware/auth.middleware";



const router = Router()
export const chatRoutes={
    base:"/chats",
    getChat:"/"
} 
const chatServices= new ChatServices()

router.get (
    chatRoutes.getChat,
    auth
    ,chatServices.getChat
)