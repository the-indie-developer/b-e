import mongoose from 'mongoose'

const donationSchema = new mongoose.Schema({
     name:{
        type:String,
        required:true
     },
     email:{
        type:String,
        required:true
     },
     amount:{
        type:Number,
        required: true
     },
     userID:{
        type:mongoose.Schema.ObjectId,
        ref:'user'
     }
     
},{timestamps:true})


export const Donation = mongoose.model('donations',donationSchema)