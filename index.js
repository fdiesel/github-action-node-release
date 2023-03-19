import * as core from "@actions/core";
import * as github from "@actions/github";
import { readFileSync } from "fs";
let created = false;
function getPackageVersion() {
    const filePath = core.getInput("path");
    const fileRaw = readFileSync(filePath, { encoding: "utf8" });
    const file = JSON.parse(fileRaw);
    return file.version;
}
async function releaseExists(octokit, tagName) {
    const { repo, owner } = github.context.repo;
    try {
        await octokit.rest.repos.getReleaseByTag({
            owner,
            repo,
            tag: tagName,
        });
        return true;
    }
    catch {
        return false;
    }
}
async function createRelease(octokit, tagName, generateReleaseNotes) {
    const { repo, owner } = github.context.repo;
    try {
        const res = await octokit.rest.repos.createRelease({
            owner,
            repo,
            tag_name: tagName,
            name: tagName,
            target_commitish: github.context.sha,
            generate_release_notes: generateReleaseNotes,
        });
        core.notice(`Created tag and release '${tagName}'`);
        created = true;
        return res.data;
    }
    catch (error) {
        core.setFailed(`Action failed with error ${error}`);
    }
}
async function main() {
    const packageVersion = core.getInput("prefix") + getPackageVersion();
    const token = core.getInput("token");
    const octokit = github.getOctokit(token);
    const generateReleaseNotes = core.getInput('notes') == 'true';
    const exists = await releaseExists(octokit, packageVersion);
    if (exists) {
        core.notice(`Release and Tag '${packageVersion}' already exists`);
    }
    else {
        await createRelease(octokit, packageVersion, generateReleaseNotes);
    }
    core.setOutput("created", created);
    core.setOutput("version", packageVersion);
}
main();
