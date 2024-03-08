const asyncHandler= (requestHandler)=>{
    return async(req,res,next)=>{  // wrap krne ke baad function ko return bhi krna hai
    Promise.resolve(requestHandler(req,res,next)).catch(
        (err)=>next(err))
    }
}

export { asyncHandler };

//Another Method
// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//   } catch (error) {
//     res.status(err.code || 500).json({
//         success:false,
//         message:err.message
//     });
//   }
// };
