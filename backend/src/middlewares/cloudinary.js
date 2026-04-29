import { v2 as cloudinary } from 'cloudinary';
import { createRequire } from 'module';
const require = createRequire(import.meta.url); 

// 1. Cargamos la librería como hiciste ayer
const cloudinaryStorage = require('multer-storage-cloudinary'); 

import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 2. Configuración (Igual que la tenías)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 3. El Almacenamiento
const storage = cloudinaryStorage({
  // Le pasamos un objeto que contiene la v2
  // Así, cuando la librería busque ".v2.uploader", lo encontrará perfectamente.
  cloudinary: { v2: cloudinary }, 
  
  folder: 'localmarkt_images',
  allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
  transformation: [{ width: 800, height: 800, crop: 'limit' }]
});

export const uploadImage = multer({ storage: storage });