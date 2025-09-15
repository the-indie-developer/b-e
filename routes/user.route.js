import express from 'express'
import {  checkOtp,  forgotPassword, genNewUserOtp, getProfilePic, handleProfileUpdate, loginUser, resetPassword, verifyNewUserOtpAndSignIn } from '../controllers/user.controller.js'
import { uploadSingleImage } from '../controllers/uploadImage.controller.js'
import { upload } from '../middlewares/multer.js'


const userRoute = express.Router()

//------------------CREATING THE NEW USER------------------------------->
userRoute.post('/user/n-otp',genNewUserOtp)
userRoute.post('/user/signup',verifyNewUserOtpAndSignIn)

//-----------------END OF CREATING NEW USER VIA OTP VERIFICATION------------->
userRoute.post('/user/login',loginUser)
userRoute.post('/user/otp',forgotPassword)
userRoute.post('/user/verify-otp',checkOtp)
userRoute.post('/user/reset-p',resetPassword)
userRoute.post('/user/upload-pic',upload.single('profilePic'),uploadSingleImage)
userRoute.post('/user/get-pic',getProfilePic)
userRoute.post('/user/c-program',handleProfileUpdate)


export {userRoute}