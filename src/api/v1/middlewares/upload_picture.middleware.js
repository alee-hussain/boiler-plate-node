/** @format */

const upload_file_to_s3 = require("@v1_helpers/upload_files_to_s3");

const process_files = async (files, date) => {
  const upload_promises = files.map((file) => upload_file_to_s3(file, date));
  return Promise.all(upload_promises);
};

const extract_urls_and_field_name = (responses) => {
  const urls = responses.map((response) => ({
    path: process.env.S3_ACCESS_URL + response.public_id,
    content_type: response.content_type,
  }));
  const fieldname = responses[0].public_id.split("/")[1];
  return { urls, fieldname };
};

const upload_image = async (req, res, next) => {
  if (!req?.files) {
    return next(); // No files to process, just move to the next middleware
  }

  const files = Object.values(req.files);
  const date = Date.now();

  try {
    const responses = await Promise.all(
      files.map((file_s) => process_files(file_s, date))
    );

    // Flatten the responses array
    const flattened_responses = [].concat(...responses);
    const { urls, fieldname } =
      extract_urls_and_field_name(flattened_responses);

    req.images[fieldname] = urls;
  } catch (error) {
    return next(error); // Handle errors from uploading
  }

  next();
};

module.exports = upload_image;
