import { setTimeout } from "timers/promises";
import os from "os";
const sandbox = require("@architect/sandbox");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

function isMacOs() {
  return os.platform() === "darwin";
}

const PORT = "8888";

export async function setup() {
  if (isMacOs() && !process.env.CI) {
    // Kill port 8888 if it's already in use
    await exec(
      `lsof -i tcp:${PORT} | awk 'NR!=1 {print $2}' | xargs kill -9 ;`
    );
    // Needs a fraction of a second to actually kill the process
    await setTimeout(100);
  }
  process.env.PORT = process.env.PORT ?? PORT;
  process.env.QUIET = process.env.QUIET ?? 1;
  process.env.ARC_TABLES_PORT = process.env.ARC_TABLES_PORT ?? 6666;
  await sandbox.start();
}

export async function teardown() {
  await sandbox.end();
}
