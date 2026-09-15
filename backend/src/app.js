const { startCronJobs } = require("./services/cron");

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

const tenantRoutes = require("./routes/tenant");
const backupRoutes = require("./routes/backup");

const archiveRoutes = require("./routes/archive");
const complianceRoutes = require("./routes/compliance");

const whatsappRoutes = require("./routes/whatsapp");
const searchRoutes = require("./routes/search");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/backup", backupRoutes);
app.use("/api/archive", archiveRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/search", searchRoutes);

connectDB().then(() => {
  startCronJobs();
});

app.use("/api/auth", authRoutes);

app.use("/api/tenant", tenantRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "M365 Backup Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
