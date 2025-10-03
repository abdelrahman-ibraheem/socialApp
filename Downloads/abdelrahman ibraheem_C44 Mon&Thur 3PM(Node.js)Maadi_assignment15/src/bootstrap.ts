import  express from 'express'
import type { NextFunction, Request, Response } from 'express'
import  dotenv from 'dotenv'
import  path from 'path'
import  baseRouter from './routes'
import { connectDB } from './dp/db.connection'
import { BadRequestException } from './utils/Error'
import { getFile } from './utils/multer/s3.services'
import { userModel } from './modules/usermodule/user.model'
import { UserRepo } from './modules/usermodule/user.repo'
import { id } from 'zod/v4/locales'
import { error } from 'console'



dotenv.config({
  path: path.resolve('./src/config/.env')
})

const app = express()

export const bootstrap  =  async() => {
  const port = process.env.PORT
connectDB()
  app.use(express.json())
  app.use('/api/v1', baseRouter)

  app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({ msg: "hello" })
  })
  app.get('/upload/*', async (req: Request, res: Response) => {
    const downloadName = req.query.downloadName as string;
    const { path } = req.params as unknown as { path: string[] };
    const Key = path.join('/');

    const s3Response = await getFile({ Key });

    if (!s3Response?.Body) {
      throw new BadRequestException('Fail to get asset');
    }

    // Set Content-Type
    res.setHeader(
      'Content-Type',
      s3Response.ContentType || 'application/octet-stream'
    );

    // Optional: force download with filename
    if (downloadName) {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${downloadName}`
      );
    }

   
  });

const test = async( )=>{
 try{
  const users = await  userModel.insertMany([
    {firstname :'abdo',
      lastname: 'ibraheem',
      email:`${Date.now()}@gmail.com`,

    }, {firstname :'abdelrahman',
      lastname: 'ibraheem',
      email:`${Date.now()+1}@gmail.com`,

    }
  ])
 }
 catch{
  console.log({error});
  
 }
}
;
try{ 

  const  user =    new userModel({ 
  userName:"test test",
  email : `${Date.now()}gmail.com`,
  password: 'abdo@123',
});
await user.save( )
user.lastname ='boda'
await user.save()
}
catch (error) {}

  app.use((err: Error, req: Request, res: Response, next: NextFunction): Response => {
    return res.status(400).json({
      errMsg: err.message,
      status: err.cause,
      stack: err.stack
    })
  })

  app.listen(port, () => {
    console.log('server running on port', port)
  })
}

module.exports = { bootstrap, app }