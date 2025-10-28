import {Router} from 'express';
import router from './modules/usermodule/user.controller';
const baseRouter = Router();    
baseRouter.use('/users', router);

export default baseRouter;