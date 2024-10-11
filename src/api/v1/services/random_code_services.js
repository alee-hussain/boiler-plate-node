/** @format */

const Base62Str = require("base62str").default;
const base62 = Base62Str.createInstance();

const trimCode = new Map();

const generate_random_numeric_code = (otpLength) => {
  let otp = "";
  for (let i = 0; i < otpLength; i++) {
    otp += Math.floor(Math.random() * 10); // Generates a random digit (0-9)
  }
  return otp;
};

const encode_user_id = (userId) => {
  const encoded = base62.encodeStr(userId);
  const trim_code = encoded.substring(0, 8);
  trimCode.set(trim_code, encoded);
  return trim_code;
};

const decode_random_code = (trim_code) => {
  if (!trimCode.has(trim_code)) {
    throw new Error("Invitation code has been expired, ask user to send again");
  }
  const code = trimCode.get(trim_code);
  const decoded = base62.decodeStr(code);
  return decoded;
};

module.exports = {
  generate_random_numeric_code,
  encode_user_id,
  decode_random_code,
};
