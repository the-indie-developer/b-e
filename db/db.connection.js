import mongoose from "mongoose";

// MongoDB database connection 

const dbConnection = async ()=>{
    try {
       await mongoose.connect(process.env.DB_KEY)
        console.log('MONGODB CONNECTED')
    } catch (error) {
        console.log('MONGODB CONNECTION ERROR : ',error)
    }
}


export {dbConnection}


