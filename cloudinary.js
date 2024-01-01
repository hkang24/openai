
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dyoip2vva', 
  api_key: '885622821674254', 
  api_secret: 'y4GPxk53vQY1zHa45ABVbms7_8U' 
});

// async function uploadPhoto(photo) {
//     try {
//       const result = await cloudinary.uploader.upload(photo, { folder: "pieces" });
//     //   console.log(result);
//       return result.url;
//     } catch (error) {
//       console.log(error);
//     }
//   }

async function reducePhoto(photo) {
    try {
      const result = await cloudinary.uploader.upload(photo, { folder: "pieces", transformation: [
        {width: 510, height: 510, crop: "fill"}
      ] });
    //   console.log(result);
      return result.url;
    } catch (error) {
      console.log(error);
    }
  }

module.exports.reducePhoto = reducePhoto;