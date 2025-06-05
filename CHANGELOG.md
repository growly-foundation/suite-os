# Changelog

All notable changes to the Suite project will be documented in this file.

## Unreleased

### Added

- **dashboard**: Added agent conversations tab and admin messaging functionality (#32)
- **core+dashboard**: Implemented agent resource management system (#33)
- **dashboard**: Restyled components and workflow canvas
- **persona**: Added new `@growly/persona` package and `libs/chainsmith` library (#31)
- **agents/tools**: Enhanced debugging and return MessageContent output type (#28)
- **agents**: Added support for returning message contents from tools
- **website**: Added guide videos section (#23)
- **suite**: Added theme system with dark mode support (#21)
- **suite**: Implemented main panel screen for quick actions (#21)

### Changed

- **workspace**: Reorganized structure to separate apps and packages/agents (#30)
- **agents**: Optimized prompt input tokens for better performance (#29)
- **dashboard**: Refactored components and added model icon
- **styles**: Reformatting with auto-sorted imports
- **suite**: Updated Growly components to latest versions
- **deps**: Renamed package organization name

### Fixed

- **ui**: Resolved inconsistent color theme issues in production (#24)
- **agent**: Fixed USDC token address control (#22)
- **suite**: Updated production backend endpoint
- **suite**: Fixed send message method
- **suite**: Set user and chat message component
- **suite**: Removed auto panel open and adjusted height for better UX
- **ci**: Fixed path to the server package
- **ui**: Fixed build issues

## 1.0.5 - 2025-06-05

### Fixed

- **suite**: Fixed production backend server endpoint

## 1.0.4 - 2025-06-05

### Changed

- **suite**: Updated backend server endpoint to production

## 1.0.3 - 2025-06-04

### Added

- **suite**: Added theme system with dark mode support
- **suite**: Implemented main panel screen for quick actions

## 1.0.2 - 2025-06-03

### Documentation

- **suite**: Updated README with latest package information

## 1.0.1 - 2025-06-02

### Security

- **suite**: Enforced production API endpoint usage only

## 1.0.0 - 2025-05-15

### Added

- **suite**: Initial experimental release of Suite features
- **suite/docs**: Comprehensive README documentation

### Changed

- **suite**: Updated server endpoint configuration
- **deps**: Renamed package organization to @getgrowly

### Fixed

- **suite**: Resolved entry file resolution issues
- **suite**: Fixed missing entry point on import
