const express = require("express");

const Tenant = require("../models/Tenant");
const ExEmployeeVault = require("../models/ExEmployeeVault");

const { getMessages } = require("../services/graphService");
const { uploadJson } = require("../services/wasabiService");

const router = express.Router();

router.post("/ex-employee", async (req, res) => {
  try {
    const { tenantId, email } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        message: "tenantId is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "email is required",
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

    const messages = await getMessages(tenant.accessToken);

    const wasabiKey =
      `archive/${tenant.tenantId}/${email}/mailbox.json`;

    await uploadJson(wasabiKey, messages);

    const totalSizeBytes = Buffer.byteLength(
      JSON.stringify(messages),
      "utf8"
    );

    const originalSizeMB = totalSizeBytes / (1024 * 1024);

    const vault = await ExEmployeeVault.create({
      tenantId: tenant._id,
      email,
      archivedAt: new Date(),
      wasabiKey,
      originalSizeMB,
      costPerYear: 49,
    });

    res.json({
      message: "Ex-employee archive completed successfully",
      vaultId: vault._id,
      email,
      wasabiKey,
      originalSizeMB,
      costPerYear: vault.costPerYear,
      itemCount: messages.length,
    });
  } catch (error) {
    console.error(
      "Ex-employee archive error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Ex-employee archive failed",
      error: error.message,
    });
  }
});

module.exports = router;