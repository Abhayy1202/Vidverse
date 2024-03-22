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

const removeCloudinary=(async (Image_Id)=>{

 try {
   const response = await cloudinary.uploader.destroy(Image_Id,{resource_type:"auto"})
   return response
 } catch (error) {
  return null;
 }
})



export { uploadCloudinary };
