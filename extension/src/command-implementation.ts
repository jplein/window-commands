import { CommandRegistry } from "window-commands-common";
import { CenterTwoThirdsCommand } from "./command-implementations/center-two-thirds.js";
import { ToggleFullscreenCommand } from "./command-implementations/toggle-fullscreen.js";
import { ToggleMaximizeCommand } from "./command-implementations/toggle-maximize.js";
import { MinimizeCommand } from "./command-implementations/minimize.js";
import { LeftHalfCommand } from "./command-implementations/left-half.js";
import { RightHalfCommand } from "./command-implementations/right-half.js";
import { CenterHalfCommand } from "./command-implementations/center-half.js";
import { CenterCommand } from "./command-implementations/center.js";
import { StandardSizeCommand } from "./command-implementations/standard-size.js";

export interface CommandImplementation {
  name: string;

  impl: () => boolean;
}

function init(implRegistry: CommandImplementationRegistry): void {
  implRegistry.add(new CenterTwoThirdsCommand());
  implRegistry.add(new ToggleFullscreenCommand());
  implRegistry.add(new ToggleMaximizeCommand());
  implRegistry.add(new MinimizeCommand());
  implRegistry.add(new LeftHalfCommand());
  implRegistry.add(new RightHalfCommand());
  implRegistry.add(new CenterHalfCommand());
  implRegistry.add(new CenterCommand());
  implRegistry.add(new StandardSizeCommand());
}

export function implementations(): CommandImplementationRegistry {
  const implRegistry = new CommandImplementationRegistry();

  init(implRegistry);

  return implRegistry;
}

export class CommandImplementationRegistry {
  private _implementations: Map<string, CommandImplementation>;

  constructor() {
    this._implementations = new Map();
  }

  add(impl: CommandImplementation): void {
    const name = impl.name;
    this._implementations.set(name, impl);
  }

  get(name: string): CommandImplementation | undefined {
    return this._implementations.get(name);
  }

  list(): CommandImplementation[] {
    return Array.from(this._implementations.values());
  }

  fill(registry: CommandRegistry): void {
    const names = registry.list().map((command) => command.name);

    names.forEach((name) => {
      const command = registry.get(name);
      if (!command) {
        throw new Error(
          `Command '${name}' is unexpectedly undefined, how did this happen?`,
        );
      }

      const impl = this.get(name);
      if (!impl) {
        throw new Error(`Implementation not found for command '${name}'`);
      }

      command.impl = () => {
        return impl.impl();
      };
    });
  }
}
