import multer from "multer";


const storage = multer.memoryStorage();

// File filter

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files allowed!'), false);
  }
};


const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  }
});

// Error handler


const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Max 5MB allowed.'
      });
    }
  }
  
  if (error.message === 'Only image files allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files allowed!'
    });
  }

  next(error);
};

export {handleMulterError, upload}