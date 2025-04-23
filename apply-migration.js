import { resolve } from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Run drizzle-kit push to create tables
exec('npx drizzle-kit push --config=drizzle.config.ts --force', {
  cwd: resolve(__dirname)
}, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing migration: ${error.message}`);
    return;
  }
  
  console.log(`Migration output: ${stdout}`);
  
  if (stderr) {
    console.error(`Migration stderr: ${stderr}`);
  }
  
  console.log('Migration completed successfully');
});