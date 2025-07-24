<div align="center">
  <p>
    <a href="https://getsuite.io">
      <img width="500px" src="https://raw.githubusercontent.com/growly-foundation/assets/refs/heads/main/logo/suite-full.png"/>
    </a>
  </p>
  <p style="font-size: 1.2em; max-width: 600px; margin: 0 auto 20px;">
    Empower DeFi Adoption with AI-powered Engine
  </p>
    <p>
  <a href="https://www.npmjs.com/package/@getgrowly/suite" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/npm/v/@getgrowly/suite?style=flat-square&color=0052FF" alt="Version" />
  </a>
  <a href="https://github.com/growly-foundation/suite/commits/main">
    <img src="https://img.shields.io/github/last-commit/growly-foundation/suite?color=0052FF&style=flat-square" alt="last update" />
  </a>
  <a href="https://www.npmjs.com/package/@getgrowly/suite" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/npm/dm/@getgrowly/suite?style=flat-square&color=0052FF" alt="Downloads per month" />
  </a>
  <a href="https://github.com/growly-foundation/suite/blob/main/LICENSE.md" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/npm/l/@getgrowly/suite?style=flat-square&color=0052FF" alt="MIT License" />
  </a>
    <img src="https://img.shields.io/coderabbit/prs/github/growly-foundation/suite?utm_source=oss&utm_medium=github&utm_campaign=growly-foundation%2Fsuite&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews&color=0052FF" alt="MIT License" />
</p>

<p>
  <a href="https://x.com/GrowlyFND">
    <img src="https://img.shields.io/twitter/follow/GrowlyFND.svg?style=social" alt="Follow @GrowlyFND" />
  </a>
  <a href="https://github.com/growly-foundation/suite/stargazers">
    <img src="https://img.shields.io/github/stars/growly-foundation/suite" alt="stars" />
  </a>
  <a href="https://github.com/growly-foundation/suite/network/members">
    <img src="https://img.shields.io/github/forks/growly-foundation/suite" alt="forks" />
  </a>
</p>
</div>

## Overview 👀💙

![growly-suite-banner](https://github.com/user-attachments/assets/40f4c28a-f28b-4bc0-9d58-82a5e506669f)

Suite is an AI-powered engine designed to streamline DeFi adoption by integrating cutting-edge AI agents into blockchain applications. Our solution bridges the gap between complex DeFi protocols and everyday users through an intuitive AI chat widget that can be easily embedded into any dApp.

Built on Base, Suite leverages the power of AI to help users navigate on-chain actions, understand DeFi opportunities, and make informed decisions without requiring deep technical knowledge of blockchain.

| Resource Name               | Link                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| Website                     | <https://getsuite.io>                                                                                 |
| Suite Dashboard             | <https://app.getsuite.io>                                                                             |
| Suite Playground            | <https://playground.getsuite.io>                                                                      |
| Suite Uniswap Demo          | <https://uniswap.getsuite.io>                                                                         |
| Original Idea Pitch         | [View the original idea](https://github.com/user-attachments/files/19884167/growly-widget-deck.2.pdf) |
| Pitch Deck for Base Batches | [View our pitch deck](https://www.figma.com/deck/uF0kJ0gn0ViJgPUUrdq1yn/-Growly-Suite--Pitch-Deck)    |

### Installation and Usage

```bash
pnpm install @getgrowly/suite
```

For detailed instructions on how to install and use Suite, please refer to the [Suite documentation](./packages/suite/README.md).

## Codebase Structure

Suite codebase is a monorepo that contains:

### Packages

- **@getgrowly/core**: Core utilities and shared functionality
- **@getgrowly/persona**: Implementation of the onchain persona module
- **@getgrowly/ui**: Reusable UI components library
- **@getgrowly/suite**: The embeddable chat widget to be installed on dApp websites

### Applications

- **@getgrowly/server**: Backend infrastructure that powers the AI agents and blockchain interactions
- **@getgrowly/website**: Landing page showcasing Suite's capabilities
- **@getgrowly/dashboard**: Admin dashboard for monitoring and managing Suite integrations

## Documentation

For developers looking to integrate Suite into their dApps, please check our [Suite integration guide](https://www.npmjs.com/package/@getgrowly/suite).

## Contributing

All code contributions, including those of people having commit access, must go through a pull request and be approved by a core developer before being merged. This is to ensure a proper review of all the code.

We truly ❤️ pull requests! If you wish to help, you can learn more about how you can contribute to this project in the contribution guide.

## Follow Us

Join our growing community around the world! Check out our website [Website](https://getsuite.io/). Follow us on [X](https://x.com/GrowlyFND), or join our live [Discord](https://discord.gg/NB4Ug72yyS) server for more help, ideas, and discussions.

## License

This repository is licensed under the [MIT License](LICENSE.md).

# Suite Project

A comprehensive development environment with Supabase, backup/restore capabilities, and team collaboration tools.

## Quick Start for New Team Members

To set up your local development environment with the latest data from the remote database:

```bash
# Clone the repository
git clone <repository-url>
cd cream

# Run the automated setup (recommended)
just setup-team-member
```

This single command will:

- ✅ Check prerequisites (Docker, Just)
- ✅ Set up environment configuration
- ✅ Configure remote database connection
- ✅ Start local Supabase services
- ✅ Backup and restore latest data from remote database
- ✅ Provide you with a fully working local environment

## Prerequisites

- **Docker Desktop**: [Download here](https://www.docker.com/products/docker-desktop)
- **Just Command Runner**: `brew install just` (macOS) or [install guide](https://just.systems/man/en/)
- **Supabase Database Connection String**: From your Supabase dashboard

## Available Commands

### Team Setup

- `just setup-team-member` - Complete setup for new team members
- `just setup-remote-db` - Configure remote database connection

### Database Operations

- `just backup-remote-db` - Backup from remote database
- `just restore-remote-backup <file>` - Restore remote backup to local
- `just backup-db` - Backup local database
- `just restore-db <file>` - Restore local backup
- `just list-backups` - List all backup files

### Supabase Services

- `just start-supabase` - Start local Supabase services
- `just stop-supabase` - Stop local Supabase services
- `just restart-supabase` - Restart Supabase services

### Development

- `just start-all` - Start all services
- `just stop-all` - Stop all services
- `just status` - Show service status
- `just logs-supabase` - Show Supabase logs

## Local Services

- **Supabase API**: http://localhost:54321
- **Supabase Studio**: http://localhost:54323
- **Database**: localhost:54322

## Documentation

- [Team Member Setup Guide](docs/team-member-setup.md) - Complete setup guide for new team members
- [Frontend Development Guide](docs/frontend-development.md) - Frontend development with local Supabase
- [Backup and Restore Guide](docs/backup-restore.md) - Database backup/restore operations
- [Remote Database Guide](docs/remote-database-guide.md) - Working with remote databases

## Project Structure

```
cream/
├── apps/                    # Application modules
│   ├── dashboard/          # Dashboard application
│   ├── infra/             # Infrastructure services
│   ├── playground/        # Development playground
│   ├── server/            # Backend server
│   └── website/           # Marketing website
├── packages/               # Shared packages
│   ├── agents/            # AI agents package
│   ├── core/              # Core utilities
│   ├── persona/           # Persona management
│   ├── suite/             # Suite components
│   └── ui/                # UI components
├── scripts/               # Development scripts
├── supabase/              # Supabase configuration
├── docs/                  # Documentation
└── backups/               # Database backups
```

## Contributing

1. Set up your local environment: `just setup-team-member`
2. Create a feature branch
3. Make your changes
4. Test your changes locally
5. Submit a pull request

## Support

For issues or questions:

1. Check the documentation in `docs/`
2. Review the troubleshooting guides
3. Ask the team for help
