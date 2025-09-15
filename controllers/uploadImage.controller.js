import { User } from "../models/user.model.js";
import cloudinary from "../uttils/cloudinary.js";


const uploadSingleImage = async (req, res) => {
  try {

    const {id} = req.body

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

     const user = await User.findOne({_id:id})

     if (!user) {
        return res.status(400).send({
            success:false,
            message:'User not found!'
        })
     }

     if (user.profilePic) {
      try {
        
        const publicId = user.profilePic.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`uploads/${publicId}`);
      } catch (deleteError) {
        console.log('Old image delete error:', deleteError);
        
      }
    }


    
    const base64String = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64String}`;

   
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'uploads',
      resource_type: 'image',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
      ]
    });



    
   


    user.profilePic = result.secure_url;

    await user.save()

    

    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: result.secure_url,
      
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
};





const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.params;
    
    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: 'Public ID required'
      });
    }

    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Image not found'
      });
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message
    });
  }
};

export {
  uploadSingleImage,
  
  deleteImage
}