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

  // Throws an error if the command is not valid
  validate(command: Command): void {
    // From https://dbus.freedesktop.org/doc/dbus-specification.html
    //
    // Member (i.e. method or signal) names:
    //   Must only contain the ASCII characters "[A-Z][a-z][0-9]_" and may not begin with a digit.
    //   Must not contain the '.' (period) character.
    //   Must not exceed the maximum name length.
    //   Must be at least 1 byte in length.
    if (!command.name) {
      throw new Error(`invalid command: name is falsy: ${command.name}`);
    }

    const name = command.name;

    // Must be at least 1 byte in length
    if (name.length < 1) {
      throw new Error(`invalid command name "${name}": must be at least 1 byte in length`);
    }

    // Must not exceed the maximum name length (255 characters)
    if (name.length > 255) {
      
      throw new Error(`invalid command name "${name}": must not exceed 255 characters (length: ${name.length})`);
    }

    // Must not begin with a digit
    if (/^[0-9]/.test(name)) {
      throw new Error(`invalid command name "${name}": must not begin with a digit`);
    }

    // Must only contain ASCII characters [A-Z][a-z][0-9]_
    if (!/^[A-Za-z0-9_]+$/.test(name)) {
      throw new Error(`invalid command name "${name}": must only contain ASCII letters, digits, and underscores`);
    }

    // Must not contain '.' (period) character
    if (name.includes('.')) {
      throw new Error(`invalid command name "${name}": must not contain period (.) character`);
    }
  }

  add(command: Command): void {
    try {
      this.validate(command);
    } catch (err) {
      throw new Error(`Error adding ${command.name}: ${err}`);
    }

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
