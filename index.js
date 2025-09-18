import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { dbConnection } from './db/db.connection.js'

dotenv.config()
dbConnection();
const port = process.env.PORT


const app = express()
const localUrl = `http://localhost:${process.env.LOCAL_PORT}}`

const allowedOrigins = [localUrl,process.env.FRONTEND_URL]

app.use(express.json())
app.use(cors({
    origin:allowedOrigins,
    credentials:true
}))

import { userRoute } from './routes/user.route.js';
import {contactRoute}from './routes/contact.route.js'
app.use('/meripehchaan/api/v1',userRoute)
app.use('/meripehchaan/api/v1',contactRoute)




app.listen(port, ()=>{
    console.log('SERVER IS RUNNING ON PORT : ', port)
})


