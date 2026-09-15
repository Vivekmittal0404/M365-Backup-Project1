const mongoose = require("mongoose");

const backupItemSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BackupJob",
      required: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    originalId: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      default: "",
    },

    wasabiKey: {
      type: String,
      required: true,
    },

    backupDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

backupItemSchema.index({
  subject: "text",
});
module.exports = mongoose.model("BackupItem", backupItemSchema);