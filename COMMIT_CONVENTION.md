# Commit Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for creating commit messages.

## Format

Each commit message consists of:

- **type**: what kind of change this commit is
- **scope** (optional): what area of the codebase this change affects
- **description**: short description of the change
- **body** (optional): longer explanation if necessary
- **footer** (optional): noting breaking changes or referencing issues

```
<type>(<scope>): <description>

<body>

<footer>
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Examples

```
feat(dashboard): add user profile page

fix(auth): resolve login redirect issue

docs(readme): update installation instructions

refactor(core): improve error handling logic
```

## Enforcing Convention

This project uses:

- **commitlint**: Validates commit messages follow convention
- **lint-staged**: Runs linters on staged files before committing
- **husky**: Manages Git hooks for validation

Commits that don't follow the convention will be rejected.
