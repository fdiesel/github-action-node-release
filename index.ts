import * as core from "@actions/core";
import * as github from "@actions/github";
import { readFileSync } from "fs";

function getPackageVersion() {
  const filePath = core.getInput("path");
  const fileRaw = readFileSync(filePath, { encoding: "utf8" });
  const file = JSON.parse(fileRaw);
  return file.version;
}

async function main() {
  console.log(getPackageVersion());
}

main();
