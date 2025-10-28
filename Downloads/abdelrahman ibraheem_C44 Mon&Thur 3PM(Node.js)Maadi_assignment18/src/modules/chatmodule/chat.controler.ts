import { Router } from "express";
import { ChatServices } from "./chat.rest.services";
import { auth } from "../../middleware/auth.middleware";



const router = Router()
export const chatRoutes={
    base:"/chats",
    getChat:"/",
    createGroup:"/create-group",
    getGroups:"/groups"

} 
const chatServices= new ChatServices()

router.get (
    chatRoutes.getChat,
    auth
    ,chatServices.getChat
)
router.post(
    chatRoutes.createGroup,
    auth,
    chatServices.createChatGroup

)
router.get(
    chatRoutes.getGroups,
    auth,
    chatServices.getChatGroup
)