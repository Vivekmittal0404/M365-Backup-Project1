require("dotenv").config();

module.exports = {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,

  microsoft: {
    clientId: process.env.MS_CLIENT_ID,
    clientSecret: process.env.MS_CLIENT_SECRET,
    tenantId: process.env.MS_TENANT_ID,
    redirectUri: process.env.MS_REDIRECT_URI,
  },

  wasabi: {
    key: process.env.WASABI_KEY,
    secret: process.env.WASABI_SECRET,
    bucket: process.env.WASABI_BUCKET,
  },
};