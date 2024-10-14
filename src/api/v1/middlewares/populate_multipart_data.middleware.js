/** @format */

const multer = require("multer");
const { bad_request_response } = require("@constants/responses");

const storage = multer.memoryStorage();
const limits = { fileSize: 10 * 1024 * 1024 }; // Allow up to 10 MB per file
const fields = [
  { name: "profile_picture", maxCount: 1 },
  { name: "space_picture", maxCount: 5 },
  { name: "item_picture", maxCount: 1 },
  { name: "identity_card_front", maxCount: 1 },
  { name: "identity_card_back", maxCount: 1 },
];

const handle_multer_error = (err) => {
  if (err && err instanceof multer.MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return "Unable to upload image. Make sure that only allowed key name is used and only one file is uploaded at a time.";
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return "Unable to upload image. Max file size limit is 10MB.";
    }
  } else if (err) {
    return err.message;
  }
};

const handle_multipart_data =
  (type = "REQUIRED") =>
  (req, res, next) => {
    const upload = multer({
      storage,
      limits,
    }).fields(fields);

    upload(req, res, (err) => {
      if (!Object.keys(req.files).length && type !== "NOT_REQUIRED") {
        const response = bad_request_response("No file to upload.");
        return res.status(response.status.code).json(response);
      }

      const error = handle_multer_error(err);

      if (error) {
        const response = bad_request_response(error);
        return res.status(response.status.code).json(response);
      }

      next();
    });
  };
module.exports = handle_multipart_data;
