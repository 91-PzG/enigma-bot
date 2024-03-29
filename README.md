<p align="center">
  <a href="http://enigma.samuelhoera.dev/" target="blank"><img src="https://upload.wikimedia.org/wikipedia/commons/3/37/Enigma-logo.svg" width="320" alt="Enigma Logo" /></a>
</p>

<p align="center">
<img src="https://img.shields.io/github/license/91-PzG/enigma-bot" alt="Package License" />
<a href="https://github.com/91-PzG/enigma-bot/actions/workflows/cd.yml"><img src="https://github.com/91-PzG/enigma-bot/actions/workflows/cd.yml/badge.svg" alt="CD Pipeline" /></a>
<a href="https://codeclimate.com/github/91-PzG/enigma-bot/"><img src="https://img.shields.io/codeclimate/maintainability/91-PzG/enigma-bot" alt="Maintainability" /></a>  
<a href="https://codeclimate.com/github/91-PzG/enigma-bot/"><img src="https://img.shields.io/codeclimate/coverage/91-PzG/enigma-bot" alt="Test Coverage" /></a>
<a href="https://snyk.io/test/github/91-PzG/enigma-bot/"><img src="https://img.shields.io/snyk/vulnerabilities/github/91-PzG/enigma-bot" alt="Vulnerabilities" /></a>
<img src="https://github.com/91-PzG/enigma-website/actions/workflows/codeql-analysis.yml/badge.svg" alt="CodeQL" />
</p>

## Description

Combination of the "Enigma"-Bot and the backend for the 91.PzG Memberportal

## Setting up your development environment

After cloning the repository and installing the dependencies contact an owner to help you fill out the `.env`-File with the necessary information.
Also you should request an invite to the development discord where we set up roles event channels etc and discuss the next steps.
After that you're good to go. To start/debug and test the bot use the following commands (defined in `package.json`):

- `npm run build` Compiles the project
- `npm run start` Starts the backend
- `npm run start:dev` Restarts the backend on each file change (you may need to abort and rerun when changing dependencies or module files)
- `npm run:start:debug` Same as above but with more logging enabled
- `npm run test` Runs all unit tests
- `npm run test:watch` Works analogous to `start dev` but reruns the test instead of restarting the application
- `npm run test:e2e` Runs the e2e tests. **Warning!** This rebuilds the database and fills it with test data. (TODO: move e2e tests to different db)

## Code of Conduct

Please read and abide by the [Code of Conduct](./CODE_OF_CONDUCT.md) .

## Development Guidelines

Please abide by the following guidelines to keep the repository as clean as possible

### Branches

#### Adding new Features and Refactoring

All feature and refactor branches must stem from the `development` branch and have to be merged back into it by pull requests.

The branchnames have to adhere to the following pattern:
`[type]/[name]`

The following types can be used:

- feature: adding new functionality
- refactor: changing code without introducing new features
- bugfix: fixing a bug
- docs: update documentation without changing production code

#### Release Branches

After all the features that will be included in the next release have been merged into master, you can create a new branch named `release/version`.
No new features may be added to this release branch. The only acceptable commits to release branches are:

- small tidying up task
- bumping the version
- fixes

#### Hotfixes

Hotfix branches may be created from master and merged directly back into it. They have to be named `hotfix/issue`

#### Master Branch

The master branch **only** contains tagged commits corresponding to software releases!
To create a new release merge a release or hotfix branch into master and create a new tag (`v1.2.3`).

### Commits

To keep our repository tidy all commits have to adhere to the [Conventional Commit Guidelines](https://www.conventionalcommits.org/en/).
You can find a brief summary below:

- Structure:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

- We use the following types:

  - fix: Fixes a bug
  - feat: Adds a new feature
  - refactor: Changes code but doesn't add new features
  - docs: Updates doc files
  - test: Updates tests but doesn't touch production code

- Breaking changes:
  If an update introduces breaking changes add a `!` after the type (and scope) and optionally add the `BREAKING CHANGE` footer.

The commit message should also follow these rules:

1. Separate subject from body with a blank line
2. Limit the subject line to 50 characters
3. Capitalize the subject line
4. Do not end the subject line with a period
5. Use the imperative mood in the subject line
   6.Wrap the body at 72 characters
6. Use the body to explain what and why vs. how
