# GitHub Action - Releases Node Application

Creates a new release based on the package.json version.

## Usage

Create a `package.json` file.

```json
{
  "version": "1.0.0"
}
```

Create a workflow file.

```yml
name: Release

on:
  push:
    branches: main

jobs:

  release:

    runs-on: ubuntu-latest
    
    outputs:
      created: ${{ steps.release.outputs.created }}
      version: ${{ steps.release.outputs.version }}

    steps:

      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Release
        id: release
        uses: fdiesel/github-action-node-release@version
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          prefix: v # (optional) default none
          path: ./package.json # (optional) default ./package.json
```
