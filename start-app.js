#!/usr/bin/env node
import { spawn } from "child_process";
const cmd = spawn("npm", ["run", "dev"]);
cmd.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});
cmd.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});
cmd.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});
