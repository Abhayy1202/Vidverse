// require("dotenv").config({path:'./env'}); // Normal Tareeka
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({ path: "./env" });
connectDB()
  .then(() => {
    app.on("errror",(error)=>{
      console.log("Errr:",error);
      throw error
    })

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port:${process.env.PORT}`);
    });
    
  })
  .catch((err) => {
    console.log("Mongo db connection failed!!!", err);
  });

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

/*(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n DB Connected!!`)
    } catch (error) {
        console.error("Error in DBconnection")

    }
})()
*/
