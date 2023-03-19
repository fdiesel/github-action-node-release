import * as core from "@actions/core";
import * as github from "@actions/github";
import { readFileSync } from "fs";
let created = false;
const { repo, owner } = github.context.repo;
function getPackageVersion() {
    const filePath = core.getInput("path");
    const fileRaw = readFileSync(filePath, { encoding: "utf8" });
    const file = JSON.parse(fileRaw);
    return file.version;
}
async function releaseExists(octokit, tagName) {
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
async function createRelease(octokit, tagName, releaseNotes = '') {
    try {
        const res = await octokit.rest.repos.createRelease({
            owner,
            repo,
            tag_name: tagName,
            name: tagName,
            target_commitish: github.context.sha,
            body: releaseNotes
        });
        core.notice(`Created tag and release '${tagName}'`);
        created = true;
        return res.data;
    }
    catch (error) {
        core.setFailed(`Action failed with error ${error}`);
    }
}
async function latestReleaseCommitHash(octokit) {
    try {
        return (await octokit.rest.repos.getLatestRelease({
            owner,
            repo
        })).data.target_commitish;
    }
    catch (error) {
        return undefined;
    }
}
async function commitMessagesSinceCommitHash(octokit, commitHash) {
    try {
        return (await octokit.rest.repos.listCommits({
            owner,
            repo,
            sha: commitHash
        })).data.map(commit => commit.commit.message);
    }
    catch (error) {
        core.setFailed(`Action failed with error ${error}`);
    }
}
async function run() {
    const packageVersion = getPackageVersion();
    const prefixedPackageVersion = core.getInput('prefix') + packageVersion;
    const token = core.getInput("token");
    const octokit = github.getOctokit(token);
    const generateReleaseNotes = core.getInput('notes') == 'true';
    const exists = await releaseExists(octokit, prefixedPackageVersion);
    let releaseNotes;
    if (exists) {
        core.notice(`Release and Tag '${prefixedPackageVersion}' already exists`);
    }
    else {
        if (generateReleaseNotes) {
            const commitHash = await latestReleaseCommitHash(octokit);
            core.info(`Latest release commit hash: ${commitHash}`);
            const commitMessages = await commitMessagesSinceCommitHash(octokit, commitHash);
            commitMessages?.forEach(msg => core.info(msg));
            releaseNotes = commitMessages?.join("\n");
        }
        await createRelease(octokit, prefixedPackageVersion, releaseNotes);
    }
    core.setOutput("created", created);
    core.setOutput("version", packageVersion);
    core.setOutput("changelog", releaseNotes || "");
}
run();
