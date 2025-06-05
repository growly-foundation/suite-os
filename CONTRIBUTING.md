# Contributing to Suite

Thank you for your interest in contributing to Suite! We welcome contributions from the community to help improve our project. This guide will help you get started with the contribution process.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [License](#license)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your forked repository
   ```bash
   git clone https://github.com/your-username/suite.git
   cd suite
   ```
3. **Install dependencies**
   ```bash
   pnpm install
   ```
4. **Create a branch** for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes following the [Code Style](#code-style) guidelines
2. Run tests to ensure nothing is broken
   ```bash
   pnpm test
   ```
3. Ensure the build passes
   ```bash
   pnpm build
   ```
4. Commit your changes following the [Commit Message Guidelines](#commit-message-guidelines)
5. Push your changes to your fork
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a Pull Request against the `main` branch

## Code Style

- Use TypeScript for all new code
- Follow the project's ESLint and Prettier configurations
- Write meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Add JSDoc comments for public APIs
- Include unit tests for new features and bug fixes

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Please format your commit messages as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Changes to the build process or auxiliary tools

### Examples:

```
feat(agents): add support for message content types
fix(ui): resolve color theme inconsistencies
chore(deps): update dependencies
```

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build
2. Update the README.md with details of changes to the interface
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent
4. You may merge the Pull Request once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the reviewer to merge it for you

## Reporting Issues

When creating an issue, please include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Any relevant error messages
- Browser/OS version if applicable

## License

By contributing to Suite, you agree that your contributions will be licensed under its [MIT License](LICENSE).
