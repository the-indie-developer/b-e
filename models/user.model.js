import mongoose from "mongoose";   // User Schema

const userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['donor','volunteer'],
        required:true
    },
    resetPasswordOTP:{
        type:String
    },
    resetPasswordExpire:{
        type:String
    },
    profilePic:{
        type:String,
        default:'https://i.ibb.co/3ywTZFTd/download.png'
    }
    ,
    program:{
        type:String,
        enum:['Education Awareness','Career Counseling','Women Empowerment','Skills Training','Environmental Protection',],
        default:'Education Awareness'
    },
    subscribed:{
        type:Boolean,
        default:false
    }
  
},{timestamps:true})

export const User = mongoose.model('user',userSchema)