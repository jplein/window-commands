# Common bash commands

- npm run build: compile and bundle both the extension and CLI
- npm run lint: run the linter for both projects
- npm install: install dependencies for both projects

# Project Structure

The project is split into two separate packages to avoid type conflicts between Node.js and GNOME Shell:

## extension/ - GNOME Shell Extension
- **extension.ts**: Entry point for the GNOME extension
- **CommandRegistry.ts**: Registry for managing window commands
- **commands/Command.ts**: Base interface for all commands
- **commands/CenterTwoThirdsCommand.ts**: Example command implementation
- **global.d.ts**: TypeScript definitions for GNOME Shell globals

The extension runs in GNOME Shell and cannot use Node.js APIs.

## cli/ - Command-Line Tool
- **cli.ts**: Node.js CLI for executing commands via DBus and generating .desktop files

The CLI runs in Node.js and cannot use GNOME Shell APIs.

## Output Targets

- dist/extension.js: The GNOME Shell extension
- dist/cli.js: The command-line tool

# Adding New Commands

1. Create a new command class in `extension/src/commands/`:
```typescript
import { Command } from './Command.js';

export class MyCommand implements Command {
    name(): string {
        return 'MyMethodName'; // DBus method name
    }

    handle(): boolean {
        // Implementation
        return true;
    }
}
```

2. Register it in `extension/src/extension.ts`:
```typescript
this._registry.register(new MyCommand());
```

3. Add the command name to the `COMMANDS` array in `cli/src/cli.ts`:
```typescript
const COMMANDS = ['CenterTwoThirds', 'MyMethodName'];
```

# Workflow

After making any code changes, verify that npm run lint and npm run build finish without errors.
