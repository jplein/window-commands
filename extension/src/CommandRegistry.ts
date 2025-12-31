import { Command } from './commands/Command.js';

/**
 * Registry for all window management commands
 */
export class CommandRegistry {
    private _commands: Map<string, Command>;

    constructor() {
        this._commands = new Map();
    }

    /**
     * Register a command
     */
    register(command: Command): void {
        const name = command.name();
        this._commands.set(name, command);
        console.log(`Registered command: ${name}`);
    }

    /**
     * Get a command by name
     */
    get(name: string): Command | undefined {
        return this._commands.get(name);
    }

    /**
     * Get all registered command names
     */
    getNames(): string[] {
        return Array.from(this._commands.keys());
    }

    /**
     * Get all registered commands
     */
    getAll(): Command[] {
        return Array.from(this._commands.values());
    }
}
