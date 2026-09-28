
import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Ye check karne ke liye ki credentials load hue ya nahi
console.log("Cloudinary Config Status:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "Loaded ✅" : "Missing ❌",
  api_key: process.env.CLOUDINARY_API_KEY ? "Loaded ✅" : "Missing ❌",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "Loaded ✅" : "Missing ❌",
});

export { cloudinary };