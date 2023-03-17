#!/usr/bin/env sh

tsc

cp package.json dist/package.json
cp assets/action.yml dist/action.yml
cp LICENSE dist/LICENSE
cp README.md dist/README.md

mkdir dist/.github
mkdir dist/.github/workflows
cp assets/dist.yml dist/.github/workflows/dist.yml

cd dist
npm install --only=production
