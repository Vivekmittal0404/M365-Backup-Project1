const AWS = require("aws-sdk");

const wasabi = new AWS.S3({
  endpoint: "https://s3.wasabisys.com",
  accessKeyId: process.env.WASABI_KEY,
  secretAccessKey: process.env.WASABI_SECRET,
  region: "us-east-1",
});

const uploadJson = async (key, data) => {
  try {
    const params = {
      Bucket: process.env.WASABI_BUCKET,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    };

    const result = await wasabi.upload(params).promise(); 

    return result;
  } catch (error) {
    console.error("Wasabi upload error:", error.message);
    throw error;
  }
};

module.exports = {
  uploadJson,
};