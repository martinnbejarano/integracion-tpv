'use strict'
import mongoose from 'mongoose'
import { envConfig } from '../utils/env.config.js'

export const connectDb = async () => {
    try {
        await mongoose.connect(envConfig.DB_URI)
        console.log('connection mongo successfully')
    } catch (error) {
        console.log(`Error connection mongo: ${error.message}`)
    }
}
