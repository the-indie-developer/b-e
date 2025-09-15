import express from 'express'
import { sendMsg } from '../controllers/contact.controller.js'

const contactRoute = express.Router()


contactRoute.post('/contact',sendMsg)



export {contactRoute}