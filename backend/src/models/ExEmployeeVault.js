const mongoose = require("mongoose");

const exEmployeeVaultSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    archivedAt: {
      type: Date,
      default: Date.now,
    },

    wasabiKey: {
      type: String,
      required: true,
    },

    originalSizeMB: {
      type: Number,
      default: 0,
    },

    costPerYear: {
      type: Number,
      default: 49,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ExEmployeeVault",
  exEmployeeVaultSchema
);