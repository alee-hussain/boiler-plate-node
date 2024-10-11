/** @format */

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("@configs/s3");
const { logger } = require("@configs/logger");

const upload_file_to_s3 = async (file, date) => {
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `${file.fieldname}/${file.originalname.split(".")[0]}-${date}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await s3.send(command);
    return {
      public_id: `/${file.fieldname}/${
        file.originalname.split(".")[0]
      }-${date}`,
      content_type: file.mimetype,
    };
  } catch (error) {
    logger.error("Error uploading image to S3.", error);
    throw error; // Rethrow to handle it in the calling function
  }
};

module.exports = upload_file_to_s3;
