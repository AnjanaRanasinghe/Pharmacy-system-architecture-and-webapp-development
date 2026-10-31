import "dotenv/config";
import { app } from "./app";
import { startBackupScheduler } from "./modules/backup/backup-scheduler";

const REQUIRED_ENV_VARS = ["DATABASE_URL", "JWT_SECRET"];
const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variable(s): ${missing.join(", ")}. Check your .env file.`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startBackupScheduler();
});