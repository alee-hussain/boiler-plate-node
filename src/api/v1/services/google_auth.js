const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verify_google_token = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log(payload, "payload");
    const { sub, email, picture, name } = payload;
    return {
      email,
      profile_picture: picture,
      user_name: name,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Error verifying Google token");
  }
};

module.exports = verify_google_token;
