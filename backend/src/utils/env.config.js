/** variables de entorno comunes en mi aplicacion **/
import dotenv from 'dotenv'
dotenv.config()

export const envConfig = {
    PORT: +process.env.PORT || 8080,
    DB_URI: process.env.DB_URI,
}
