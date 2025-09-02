// pages/api/upload.js (Cloudinary Version - Fixed)
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Disable Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = new IncomingForm();
    
    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    // Check if image file exists - handle different file structures
    let filePath;
    if (data.files.image) {
      // Handle both single file and array of files
      const imageFile = Array.isArray(data.files.image) 
        ? data.files.image[0] 
        : data.files.image;
      filePath = imageFile.filepath;
    } else {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'school-images',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' },
        { format: 'auto' }
      ]
    });

    // Delete temporary file
    fs.unlinkSync(filePath);

    // Return Cloudinary URL
    return res.status(200).json({
      message: 'File uploaded successfully',
      path: result.secure_url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
}