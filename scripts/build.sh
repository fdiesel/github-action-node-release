#!/usr/bin/env sh

tsc

cp package.json dist/package.json
cp src/action.yml dist/action.yml
cp LICENSE dist/LICENSE
cp README.md dist/README.md

mkdir dist/.github
mkdir dist/.github/workflows
cp src/dist.yml dist/.github/workflows/dist.yml

cd dist
npm install --omit=dev
