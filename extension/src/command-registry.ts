import { Command } from "./commands/command.js";
import { CenterTwoThirdsCommand } from "./commands/center-two-thirds.js";
import { COMMANDS_METADATA } from "./command-metadata.js";

/**
 * Registry for all window management commands
 */
export class CommandRegistry {
  private static _instance?: CommandRegistry;
  private _commands: Map<string, Command>;

  constructor() {
    this._commands = new Map();
  }

  /**
   * Create a registry with all available commands pre-registered
   * Commands are registered based on COMMANDS_METADATA
   */
  static get instance(): CommandRegistry {
    if (this._instance) {
      return this._instance;
    }

    const registry = new CommandRegistry();

    // Register all commands from metadata
    // Map command names to their implementations
    for (const metadata of COMMANDS_METADATA) {
      switch (metadata.name) {
        case "CenterTwoThirds":
          registry.register(new CenterTwoThirdsCommand());
          break;
        // Add more command cases here as needed
        default:
          console.warn(`No implementation found for command: ${metadata.name}`);
      }
    }

    this._instance = registry;
    return this._instance;
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
