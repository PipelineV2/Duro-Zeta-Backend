import morgan from 'morgan'
import { IS_PRODUCTION } from './config'
import logger from './logger.config'


const getIpFormat = () => (IS_PRODUCTION ? ':remote-addr - ' : '')
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`
// const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`

export const morganSuccessHandler = morgan(successResponseFormat, {
  skip: (req: any, res: { statusCode: number }) => res.statusCode >= 400,
  stream: { write: (message: string) => logger.info(message.trim()) },
})

export const morganErrorHandler = morgan(errorResponseFormat, {
  skip: (req: any, res: { statusCode: number }) => res.statusCode < 400,
  stream: { write: (message: string) => logger.error(message.trim()) },
})
