const express = require("express");

const Tenant = require("../models/Tenant");
const BackupItem = require("../models/BackupItem");

const router = express.Router();

router.post("/ai", async (req, res) => {
  try {
    const { tenantId, query } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        message: "tenantId is required",
      });
    }

    if (!query) {
      return res.status(400).json({
        message: "query is required",
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

    const results = await BackupItem.find({
      tenantId: tenant._id,
      $text: {
        $search: query.trim(),
      },
    })
      .sort({
        backupDate: -1,
      })
      .limit(20);

    res.json({
      message: "Search completed successfully",
      count: results.length,
      results,
    });
  } catch (error) {
    console.error(
      "Search error:",
      error.message
    );

    res.status(500).json({
      message: "Search failed",
      error: error.message,
    });
  }
});

module.exports = router;