import mongoose, { model, models, Schema, Types, type HydratedDocument } from "mongoose";
import type { IUser } from "../usermodule/user.model";



export interface Imessage{
    createdBy: Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
export type HMessageDocument= HydratedDocument<Imessage>;

const messageSchema= new Schema<Imessage>({
    createdBy:{type:mongoose.SchemaTypes.ObjectId,ref:'User'},
    content:{type:String,required:true},
    
},{
    timestamps:true
})

export interface Ichat extends HydratedDocument<IUser> {
    participants: Types.ObjectId[];
    message: Imessage[]

    group?: string;
    groupImage:string;
    roomId:string;



    createdBy: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;

}
export type HChatDocument= HydratedDocument<Ichat>;
const chatSchema = new Schema<Ichat>({
    participants:[{type:mongoose.SchemaTypes.ObjectId,ref:'User', required:true}],
    message:[{type:messageSchema, default:[]}],
    group:{type:String},
    groupImage:{type:String},
    roomId:{type:String,},
    createdBy:{type:mongoose.SchemaTypes.ObjectId,ref:'User', required:true},

},{
    timestamps:true
})
export const chatModel=models.chat|| model<Ichat>('Chat',chatSchema);