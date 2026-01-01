import { CommandRegistry } from "./command-registry.js";
import { CommandCenterTwoThirds } from "./commands/center-two-thirds.js";

export { Command } from "./command.js";
export { CommandRegistry } from "./command-registry.js";

function init(reg: CommandRegistry): void {
  reg.add(new CommandCenterTwoThirds());
}

export function registry(): CommandRegistry {
  const reg = CommandRegistry.instance;

  init(reg);

  return reg;
}
