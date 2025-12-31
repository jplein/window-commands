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

The CLI runs in Node.js and does not use GNOME Shell APIs.

## Output Targets

- dist/extension.js: The GNOME Shell extension
- dist/cli.js: The command-line tool

# Adding New Commands

1. Add the command metadata to `extension/src/commandMetadata.ts`:
```typescript
export const COMMANDS_METADATA: CommandMetadata[] = [
    {
        name: 'CenterTwoThirds',
        description: 'Center window and resize to 2/3 screen width',
    },
    {
        name: 'MyMethodName',
        description: 'Description of what it does',
    },
];
```

2. Create the command implementation in `extension/src/commands/`:
```typescript
import { Command } from './Command.js';

export class MyCommand implements Command {
    name(): string {
        return 'MyMethodName';
    }

    handle(): boolean {
        // Implementation
        return true;
    }
}
```

3. Register it in `extension/src/CommandRegistry.ts` in the `createDefault()` method:
```typescript
case 'MyMethodName':
    registry.register(new MyCommand());
    break;
```

The CLI will automatically pick up the new command from the metadata - no changes needed in the CLI code!

# Workflow

After making any code changes, verify that npm run lint and npm run build finish without errors.
