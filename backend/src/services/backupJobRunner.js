const Tenant = require("../models/Tenant");
const BackupJob = require("../models/BackupJob");
const BackupItem = require("../models/BackupItem");

const { getMessages } = require("./graphService");
const { uploadJson } = require("./wasabiService");

const runBackupForTenant = async (tenant) => {
  const backupJob = await BackupJob.create({
    tenantId: tenant._id,
    type: "mail",
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

      await uploadJson(
        wasabiKey,
        message
      );

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

    return backupJob;
  } catch (error) {
    backupJob.status = "failed";
    backupJob.completedAt = new Date();

    await backupJob.save();

    throw error;
  }
};

const runDailyBackup = async () => {
  const tenants = await Tenant.find({
    status: "active",
  });

  console.log(
    `Starting daily backup for ${tenants.length} active tenant(s)`
  );

  for (const tenant of tenants) {
    try {
      await runBackupForTenant(tenant);

      console.log(
        `Daily backup completed for tenant ${tenant.tenantId}`
      );
    } catch (error) {
      console.error(
        `Daily backup failed for tenant ${tenant.tenantId}:`,
        error.message
      );
    }
  }
};

module.exports = {
  runBackupForTenant,
  runDailyBackup,
};