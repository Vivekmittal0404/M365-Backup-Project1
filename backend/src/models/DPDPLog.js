const mongoose = require("mongoose");

const dpdpLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    dataType: {
      type: String,
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    retentionUntil: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        return date;
      },
    },

    immutable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DPDPLog", dpdpLogSchema);