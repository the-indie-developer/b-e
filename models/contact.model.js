import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true,
        expires: 3600
    }

},{timestamps:true})


export const Contact = mongoose.model('contact-quarries',contactSchema)