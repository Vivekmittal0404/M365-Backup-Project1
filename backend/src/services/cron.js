const cron = require("node-cron");

const {
  runDailyBackup,
} = require("./backupJobRunner");

const startCronJobs = () => {
  cron.schedule(
    "0 2 * * *",
    async () => {
      console.log("Running daily M365 backup...");

      try {
        await runDailyBackup();
      } catch (error) {
        console.error(
          "Daily backup error:",
          error.message
        );
      }
    }
  );

  console.log(
    "Daily backup cron scheduled for 2:00 AM"
  );
};

module.exports = {
  startCronJobs,
};