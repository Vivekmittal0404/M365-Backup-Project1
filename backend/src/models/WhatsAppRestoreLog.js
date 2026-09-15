const mongoose = require("mongoose");

const whatsappRestoreLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    query: {
      type: String,
      required: true,
      trim: true,
    },

    restoredFile: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("WhatsAppRestoreLog", whatsappRestoreLogSchema);
