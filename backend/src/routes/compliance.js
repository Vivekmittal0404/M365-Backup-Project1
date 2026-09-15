const express = require("express");
const PDFDocument = require("pdfkit");

const Tenant = require("../models/Tenant");
const DPDPLog = require("../models/DPDPLog");

const router = express.Router();

router.get("/dpdp-report", async (req, res) => {
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

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const logs = await DPDPLog.find({
      tenantId: tenant._id,
      timestamp: {
        $gte: oneYearAgo,
      },
    }).sort({
      timestamp: -1,
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="dpdp-report-${tenantId}.pdf"`
    );

    const doc = new PDFDocument({
      margin: 50,
    });

    doc.pipe(res);

    doc
      .fontSize(20)
      .text("DPDP Compliance Report", {
        align: "center",
      });

    doc.moveDown();

    doc
      .fontSize(11)
      .text(`Tenant ID: ${tenantId}`);

    doc.text(
      `Report period: ${oneYearAgo.toISOString()} to ${new Date().toISOString()}`
    );

    doc.moveDown();

    doc
      .fontSize(14)
      .text(`Total compliance logs: ${logs.length}`);

    doc.moveDown();

    if (logs.length === 0) {
      doc
        .fontSize(11)
        .text("No DPDP logs found for the selected period.");
    } else {
      logs.forEach((log, index) => {
        doc
          .fontSize(11)
          .text(`Log ${index + 1}`);

        doc.text(`Action: ${log.action}`);
        doc.text(`User Email: ${log.userEmail}`);
        doc.text(`Data Type: ${log.dataType}`);
        doc.text(`Timestamp: ${log.timestamp.toISOString()}`);
        doc.text(`Retention Until: ${log.retentionUntil.toISOString()}`);
        doc.text(`Immutable: ${log.immutable}`);

        doc.moveDown();
      });
    }

    doc.end();
  } catch (error) {
    console.error(
      "DPDP report error:",
      error.message
    );

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to generate DPDP report",
        error: error.message,
      });
    }
  }
});

module.exports = router;