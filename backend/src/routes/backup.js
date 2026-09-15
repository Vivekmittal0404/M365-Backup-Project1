const express = require("express");
const Tenant = require("../models/Tenant");
const BackupJob = require("../models/BackupJob");
const BackupItem = require("../models/BackupItem");
const { getMessages } = require("../services/graphService");
const { uploadJson } = require("../services/wasabiService");

const router = express.Router();


router.post("/start", async (req, res) => {
  try {
    const { tenantId, types } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        message: "tenantId is required",
      });
    }

    if (!Array.isArray(types) || types.length === 0) {
      return res.status(400).json({
        message: "types must be a non-empty array",
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

    const backupJob = await BackupJob.create({
      tenantId: tenant._id,
      type: types.join(","),
      status: "running",
      startedAt: new Date(),
      itemCount: 0,
    });

    try {
      const messages = await getMessages(
  tenant.accessToken
);

      let itemCount = 0;

      for (const message of messages) {
        const wasabiKey =
          `backups/${tenant.tenantId}/${message.id}.json`;

        await uploadJson(wasabiKey, message);

        await BackupItem.create({
          jobId: backupJob._id,
          tenantId: tenant._id,
          originalId: message.id,
          subject: message.subject || "",
          wasabiKey,
          backupDate: new Date(),
        });

        itemCount++;
      }

      backupJob.status = "completed";
      backupJob.completedAt = new Date();
      backupJob.itemCount = itemCount;

      await backupJob.save();

      return res.json({
        message: "Backup completed successfully",
        jobId: backupJob._id,
        itemCount,
      });
    } catch (backupError) {
      backupJob.status = "failed";
      backupJob.completedAt = new Date();

      await backupJob.save();

      throw backupError;
    }
  } catch (error) {
    console.error(
      "Backup start error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Backup failed",
      error: error.message,
    });
  }
});

router.get("/jobs", async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({
        message: "tenantId is required",
      });
    }

    const tenant = await Tenant.findOne({
      tenantId,
    });

    if (!tenant) {
      return res.status(404).json({
        message: "Tenant not found",
      });
    }

    const jobs = await BackupJob.find({
      tenantId: tenant._id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      jobs,
    });
  } catch (error) {
    console.error(
      "Get backup jobs error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to get backup jobs",
      error: error.message,
    });
  }
});

module.exports = router;