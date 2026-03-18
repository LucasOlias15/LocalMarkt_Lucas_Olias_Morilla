import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config(); // Para asegurarnos de que lee tu .env

// 1. Le damos nuestras credenciales a Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configuramos "el almacén" (Storage)
// Aquí le decimos a Multer que no guarde los archivos en tu disco duro, sino en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'localmarkt_images', // Cloudinary creará esta carpeta automáticamente
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Solo permitimos imágenes
    transformation: [{ width: 800, height: 800, crop: 'limit' }] // Comprime y limita el tamaño para que la web no vaya lenta
  }
});

// 3. Creamos el "middleware" que usaremos en nuestras rutas
export const uploadImage = multer({ storage: storage });