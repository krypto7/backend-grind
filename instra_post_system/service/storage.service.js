const { ImageKit } = require("@imagekit/nodejs");
require("dotenv").config();

const client = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const uploadFile = async (buffer) => {
  try {
    const result = await client.files.upload({
      file: buffer.toString("base64"),
      fileName: Date.now() + ".jpg",
    });

    console.log("uploadfile ===>", result);
    return result;
  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    throw error;
  }
};

module.exports = uploadFile;
