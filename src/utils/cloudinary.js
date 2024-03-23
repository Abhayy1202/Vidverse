import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log(response)
    fs.unlinkSync(localFilePath);
    // console.log("file is uploaded on cloudinary", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

//remove files from cloudinary
const removeCloudinary = async (image_url) => {
  const parts = image_url.split("/");
  const publicId = parts[parts.length - 1].split(".")[0];
  console.log(publicId)
  await cloudinary.uploader.destroy(publicId, (error, result) => {
    if (error) {
      console.error(error);
      // Handle error
    } else {
      console.log(result);
      // Image deleted successfully
    }
  });
};



export { uploadCloudinary, removeCloudinary };
