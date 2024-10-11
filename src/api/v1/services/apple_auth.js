const jwt = require("jsonwebtoken");

const verify_apple_token = async (token) => {
  try {
    const { header, payload } = jwt.decode(token, { complete: true });

    if (
      header.alg !== "RS256" ||
      payload.iss !== "https://appleid.apple.com" ||
      payload.aud !== "com.your.app.bundleId" ||
      Date.now() >= payload.exp * 1000
    ) {
      throw new Error("Invalid Apple token");
    }
    return {
      email: payload.email || "",
      user_name: payload?.user_name || "",
      profile_picture: payload?.profile_picture || "",
    };
  } catch (error) {
    console.log(error);
    throw new Error("Error verifying Apple token");
  }
};

module.exports = verify_apple_token;
