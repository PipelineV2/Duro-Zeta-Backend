import dotenv from "dotenv";
import path from "path"

const getEnvFile = (environment: string | undefined) => {
  switch (environment) {
    case "prod":
      return "prod.env"
    case "beta":
      return "beta.env"
    case "test":
      return "test.env"
    case "dev":
      return ".env"
    default:
      return "no env found"
  }
}
dotenv.config({
  path: path.resolve(__dirname, "..", "..", getEnvFile(process.env.NODE_ENV)),
})
export class config {
  RAPID_API_KEY = process.env.RAPID_API_KEY || 'no rapid api key'
}

export const ENVIRONMENT = process.env.NODE_ENV || 'dev'
export const IS_PRODUCTION = ENVIRONMENT === 'production'
export const IS_TEST = ENVIRONMENT === 'test'
export const APP_PORT = Number(process.env.APP_PORT) || 9000
export const APP_PREFIX_PATH = process.env.APP_PREFIX_PATH || '/'
// export const JWT_SECRET = process.env.JWT_SECRET || 'oseuchesamuel'
// export const JWT_EXPIRE = process.env.JWT_EXPIRE || '1y'
export const DB = {
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_USER_PWD,
  HOST: process.env.DB_HOST,
  NAME: process.env.DB_NAME,
  PORT: Number(process.env.DB_PORT) || 27017,
}
export const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/'
export const RAPID_API_KEY = process.env.RAPID_API_KEY || 'no rapid api key'

