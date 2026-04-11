const { ImageKit } = require("@imagekit/nodejs");
require("dotenv").config();

const client = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const uploadFile = async (file) => {
  try {
    const result = await client.files.upload({
      file,
      fileName: "music_" + Date.now(),
      folder: "YT-BCKEND/music",
    });
    return result;
  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    throw error;
  }
};
module.exports = { uploadFile };
