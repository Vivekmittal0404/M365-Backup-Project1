const express = require("express");

const Tenant = require("../models/Tenant");
const BackupItem = require("../models/BackupItem");
const WhatsAppRestoreLog = require("../models/WhatsAppRestoreLog");

const router = express.Router();

router.post("/webhook", async (req, res) => {
  try {
    const { From, Body, tenantId } = req.body;

    if (!From) {
      return res.status(400).json({
        message: "From is required",
      });
    }

    if (!Body) {
      return res.status(400).json({
        message: "Body is required",
      });
    }

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

    const query = Body.trim();

    const backupItem = await BackupItem.findOne({
      tenantId: tenant._id,
      $text: {
        $search: query,
      },
    }).sort({
      backupDate: -1,
    });

    if (!backupItem) {
      await WhatsAppRestoreLog.create({
        tenantId: tenant._id,
        phone: From,
        query,
        restoredFile: "",
        status: "not_found",
      });

      return res.json({
        message: "No matching backup found",
        reply: "No matching backup file was found.",
      });
    }

    await WhatsAppRestoreLog.create({
      tenantId: tenant._id,
      phone: From,
      query,
      restoredFile: backupItem.wasabiKey,
      status: "found",
    });

    return res.json({
      message: "Backup found successfully",
      reply: `Backup found: ${backupItem.subject || "Untitled"}`,
      backup: {
        id: backupItem._id,
        subject: backupItem.subject,
        wasabiKey: backupItem.wasabiKey,
        backupDate: backupItem.backupDate,
      },
    });
  } catch (error) {
    console.error(
      "WhatsApp webhook error:",
      error.message
    );

    res.status(500).json({
      message: "WhatsApp webhook failed",
      error: error.message,
    });
  }
});

module.exports = router;