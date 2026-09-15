const axios = require("axios");

const getTokenInfo = (accessToken) => {
  try {
    const parts = accessToken.split(".");

    if (parts.length !== 3) {
      return {
        validJwtFormat: false,
      };
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    );

    return {
      validJwtFormat: true,
      aud: payload.aud,
      scp: payload.scp,
      exp: payload.exp
        ? new Date(payload.exp * 1000).toISOString()
        : null,
      iat: payload.iat
        ? new Date(payload.iat * 1000).toISOString()
        : null,
      tid: payload.tid,
      ver: payload.ver,
    };
  } catch (error) {
    return {
      validJwtFormat: false,
      decodeError: error.message,
    };
  }
};

const getMessages = async (accessToken) => {
  try {
    console.log("Microsoft access token info:");
    console.log(getTokenInfo(accessToken));

    const response = await axios.get(
      "https://graph.microsoft.com/v1.0/me/messages",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          $top: 10,
        },
      }
    );

    return response.data.value || [];
  } catch (error) {
    console.error(
      "Microsoft Graph status:",
      error.response?.status
    );

    console.error(
      "Microsoft Graph response:",
      JSON.stringify(error.response?.data, null, 2)
    );

    throw error;
  }
};

module.exports = {
  getMessages,
};