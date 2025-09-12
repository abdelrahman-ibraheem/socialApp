import  express from 'express'
import type { NextFunction, Request, Response } from 'express'
import  dotenv from 'dotenv'
import  path from 'path'
import  baseRouter from './routes'
import { connectDB } from './models/db.connection'
dotenv.config({
  path: path.resolve('./src/config/.env')
})

const app = express()

export const bootstrap = () => {
  const port = process.env.PORT
connectDB()
  app.use(express.json())
  app.use('/api/v1', baseRouter)

  app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({ msg: "hello" })
  })

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