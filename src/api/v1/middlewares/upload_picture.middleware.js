/** @format */

const upload_file_to_s3 = require("@v1_helpers/upload_files_to_s3");

const process_files = async (files, date) => {
  const upload_promises = files.map((file) => upload_file_to_s3(file, date));
  return Promise.all(upload_promises);
};

const extract_urls_and_field_name = (responses) => {
  const images = {};
  responses.map((response) => {
    const fieldname = response.public_id.split("/")[1];
    if (!images[fieldname]) {
      images[fieldname] = [
        {
          path: process.env.S3_ACCESS_URL + response.public_id,
          content_type: response.content_type,
        },
      ];
    } else {
      images[fieldname].push({
        path: process.env.S3_ACCESS_URL + response.public_id,
        content_type: response.content_type,
      });
    }
  });
  return images;
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
    const images = extract_urls_and_field_name(flattened_responses);

    req.images = images;
  } catch (error) {
    return next(error); // Handle errors from uploading
  }

  next();
};

module.exports = upload_image;
