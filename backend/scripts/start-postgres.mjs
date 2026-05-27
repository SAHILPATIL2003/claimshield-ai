import EmbeddedPostgres from 'embedded-postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../.pgdata');
const port = Number(process.env.PG_PORT || 5432);

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'postgres',
  password: 'password',
  port,
  persistent: true,
});

await pg.initialise();
await pg.start();
console.log(`PostgreSQL ready on port ${port}`);

process.on('SIGINT', async () => {
  await pg.stop();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await pg.stop();
  process.exit(0);
});

// Keep process alive
setInterval(() => {}, 60000);
