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

1. Add a metadata class for the new command under `common/src/commands`:
```typescript
import { Command } from "../command.js";

export class YourCommandHere implements Command {
  public name = "YourCommandHere";

  public description =
    "This is what your command does";
}
```

2. Import your class and add it to the common command registry in the `init()` function in `common/src/common.ts`:

```typescript
function init(reg: CommandRegistry): void {
  reg.add(new CommandCenterTwoThirds());
  reg.add(new YourCommandHere()); // your new command
}
```

3. Create the command implementation in `extension/src/commands/`:
```typescript
import { Command } from './Command.js';

export class MyCommand implements Command {
    public name: string 'YourCommandHere'; // This must match the name field  of the metadata class

    impl(): boolean {
        // Implementation
        return true;
    }
}
```

4. Import and register your implementation class in the `init()` function in `extension/src/command-implementation.ts`:
```typescript
function init(implRegistry: CommandImplementationRegistry): void {
  implRegistry.add(new CenterTwoThirdsCommand());
  implRegistry.add(new YourCommandHere()); // Your new command
}
```

# Workflow

After making any code changes, verify that npm run lint and npm run build finish without errors.
