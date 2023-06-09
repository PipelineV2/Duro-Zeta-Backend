import express from 'express'
import helmet from 'helmet'
// import xss from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'
import compression from 'compression'
import cors from 'cors'
// import routes from './routes'
import { morganSuccessHandler, morganErrorHandler } from './config/morgan.config'
import { IS_TEST } from './config/config'
import httpStatus from 'http-status'
import ApiError from './utils/ApiError'
import { errorConverter, errorHandler } from './middleware/error'
import userRoutes from "./routes/user.routes"
import businessRoutes from "./routes/business.routes"

import { Server } from 'socket.io';
import { createServer } from 'http';
import {updateQueueStatus} from "../src/services/cron.service"


const app = express()

const server = createServer(app);


const io = new Server(server);


if (!IS_TEST) {
  app.use(morganSuccessHandler)
  app.use(morganErrorHandler)
}

// set security HTTP headers
app.use(helmet())

// parse json request body
app.use(express.json())

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }))

// sanitize request data
// app.use(xss())
app.use(mongoSanitize())

// gzip compression
app.use(compression())

app.use(cors())

// routes loaded here
app.use("/user", userRoutes)
app.use("/business", businessRoutes)

app.get('/', (_req, res) => {
  res.send('Healthy')
})

// app.use(APP_PREFIX_PATH, routes)

// send back a 404 error for any unknown api request
app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'))
})

updateQueueStatus();
// convert error to ApiError, if needed
app.use(errorConverter)

// handle error
app.use(errorHandler)



export default app
