const express = require("express");
const msal = require("@azure/msal-node");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Tenant = require("../models/Tenant");

const router = express.Router();

const msalConfig = {
  auth: {
    clientId: process.env.MS_CLIENT_ID,
    clientSecret: process.env.MS_CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}`,
  },
};

const msalClient = new msal.ConfidentialClientApplication(msalConfig);

const scopes = [
  "openid",
  "profile",
  "offline_access",
  "Mail.Read",
  "Sites.Read.All",
  "Files.ReadWrite",
];

/*
|--------------------------------------------------------------------------
| Generate Microsoft OAuth URL
|--------------------------------------------------------------------------
*/
router.get("/connect-url", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId = decoded.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    const state = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const authUrl = await msalClient.getAuthCodeUrl({
      scopes,
      redirectUri: process.env.MS_REDIRECT_URI,
      responseMode: "query",
      state,
    });

    console.log("Generated Microsoft OAuth URL");

    res.json({
      url: authUrl,
    });
  } catch (error) {
    console.error("Microsoft OAuth URL error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired authentication token",
      });
    }

    res.status(500).json({
      message: "Failed to generate Microsoft OAuth URL",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Microsoft OAuth Callback
|--------------------------------------------------------------------------
*/
router.get("/callback", async (req, res) => {
  try {
    const {
      code,
      state,
      error,
      error_description,
    } = req.query;

    if (error) {
      return res.status(400).json({
        message: "Microsoft OAuth authorization failed",
        error,
        error_description,
      });
    }

    if (!code) {
      return res.status(400).json({
        message: "Authorization code is missing",
      });
    }

    if (!state) {
      return res.status(400).json({
        message: "OAuth state is missing",
      });
    }

    const decodedState = jwt.verify(
      state,
      process.env.JWT_SECRET
    );

    const userId = decodedState.userId;

    const tokenRequest = {
      code,
      scopes,
      redirectUri: process.env.MS_REDIRECT_URI,
    };

    console.log("Exchanging authorization code for token...");

    const response = await msalClient.acquireTokenByCode(
      tokenRequest
    );

    if (!response.accessToken) {
      return res.status(500).json({
        message: "Microsoft access token was not received",
      });
    }

    const microsoftTenantId =
      response.account?.tenantId ||
      response.idTokenClaims?.tid;

    if (!microsoftTenantId) {
      return res.status(500).json({
        message: "Microsoft tenant ID was not received",
      });
    }

    const tenant = await Tenant.findOneAndUpdate(
      {
        userId,
        tenantId: microsoftTenantId,
      },
      {
        userId,
        tenantId: microsoftTenantId,
        accessToken: response.accessToken,
        refreshToken: null,
        displayName:
          response.account?.name ||
          response.account?.username ||
          "",
        status: "active",
      },
      {
        new: true,
        upsert: true,
      }
    );

    const frontendUrl =
  process.env.FRONTEND_URL || "http://localhost:3000";

return res.redirect(
  `${frontendUrl}/connect?success=true&tenantId=${encodeURIComponent(
    tenant.tenantId
  )}`
);
  } catch (error) {
    console.error("Microsoft OAuth callback error:", error);

    res.status(500).json({
      message: "Microsoft OAuth failed",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Test Microsoft Graph connection
|--------------------------------------------------------------------------
*/
router.get("/test-graph", async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({
        message: "tenantId is required",
      });
    }

    const tenant = await Tenant.findOne({
      tenantId,
      status: "active",
    });

    if (!tenant) {
      return res.status(404).json({
        message: "Active tenant not found",
      });
    }

    const response = await axios.get(
      "https://graph.microsoft.com/v1.0/me",
      {
        headers: {
          Authorization: `Bearer ${tenant.accessToken}`,
        },
      }
    );

    res.json({
      message: "Microsoft Graph connection successful",
      user: {
        id: response.data.id,
        displayName: response.data.displayName,
        mail: response.data.mail,
        userPrincipalName: response.data.userPrincipalName,
      },
    });
  } catch (error) {
    console.error(
      "Graph test error:",
      error.response?.status,
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Microsoft Graph test failed",
      status: error.response?.status || 500,
      error: error.response?.data || error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Test Microsoft Graph Messages
|--------------------------------------------------------------------------
*/
router.get("/test-messages", async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({
        message: "tenantId is required",
      });
    }

    const tenant = await Tenant.findOne({
      tenantId,
      status: "active",
    });

    if (!tenant) {
      return res.status(404).json({
        message: "Active tenant not found",
      });
    }

    const response = await axios.get(
      "https://graph.microsoft.com/v1.0/me/messages",
      {
        headers: {
          Authorization: `Bearer ${tenant.accessToken}`,
        },
        params: {
          $top: 10,
        },
      }
    );

    res.json({
      message: "Microsoft Graph messages successful",
      count: response.data.value?.length || 0,
      messages: response.data.value || [],
    });
  } catch (error) {
    console.error("========== GRAPH MESSAGES ERROR ==========");
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("Headers:", error.response?.headers);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
    console.error("==========================================");

    res.status(500).json({
      message: "Microsoft Graph messages test failed",
      status: error.response?.status || 500,
      statusText: error.response?.statusText || null,
      error: error.response?.data || error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| List Connected Microsoft 365 Tenants
|--------------------------------------------------------------------------
*/
router.get("/list", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId = decoded.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    const tenants = await Tenant.find({
      userId,
    }).sort({ createdAt: -1 });

    res.json({
      tenants: tenants.map((tenant) => ({
        tenantId: tenant.tenantId,
        displayName: tenant.displayName,
        status: tenant.status,
      })),
    });
  } catch (error) {
    console.error("Tenant list error:", error);

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Invalid or expired authentication token",
      });
    }

    res.status(500).json({
      message: "Failed to load tenants",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| List Connected Microsoft 365 Tenants
|--------------------------------------------------------------------------
*/
router.get("/list", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId = decoded.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    const tenants = await Tenant.find({
      userId,
    }).sort({ createdAt: -1 });

    res.json({
      tenants: tenants.map((tenant) => ({
        tenantId: tenant.tenantId,
        displayName: tenant.displayName,
        status: tenant.status,
      })),
    });
  } catch (error) {
    console.error("Tenant list error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired authentication token",
      });
    }

    res.status(500).json({
      message: "Failed to load tenants",
      error: error.message,
    });
  }
});
module.exports = router;