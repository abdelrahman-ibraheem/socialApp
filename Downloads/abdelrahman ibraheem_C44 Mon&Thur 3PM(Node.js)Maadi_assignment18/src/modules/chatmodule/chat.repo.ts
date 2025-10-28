import type { FlattenMaps, HydratedDocument, Model, ProjectionFields, QueryOptions, RootFilterQuery } from "mongoose";
import { DBRepo } from "../../dp/dp.repo";
import { chatModel, type Ichat } from "./chat.model";

export class chatRepo extends DBRepo<Ichat>{
    constructor(protected override readonly model:Model<Ichat>=chatModel){
        super(model);



           
        }
        
    }
