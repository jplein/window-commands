import { Command } from "./command.js";

export class CommandRegistry {
  private static _instance?: CommandRegistry;
  private _commands: Map<string, Command>;

  constructor() {
    this._commands = new Map();
  }

  static get instance(): CommandRegistry {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new CommandRegistry();
    return this._instance;
  }

  add(command: Command): void {
    const name = command.name;
    this._commands.set(name, command);
  }

  get(name: string): Command | undefined {
    return this._commands.get(name);
  }

  list(): Command[] {
    return Array.from(this._commands.values());
  }
}
