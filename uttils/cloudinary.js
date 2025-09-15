import {v2 as cloudinary} from 'cloudinary'

import dotenv from 'dotenv'

dotenv.config()


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});


export const testConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connected successfully');
    return result;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error);
    throw error;
  }
};

export default cloudinary
