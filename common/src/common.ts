import { CommandRegistry } from "./command-registry.js";
import { CommandCenterTwoThirds } from "./commands/center-two-thirds.js";
import { CommandToggleFullscreen } from "./commands/toggle-fullscreen.js";
import { CommandToggleMaximize } from "./commands/toggle-maximize.js";
import { CommandLeftHalf } from "./commands/left-half.js";
import { CommandRightHalf } from "./commands/right-half.js";
import { CommandCenterHalf } from "./commands/center-half.js";
import { CommandCenter } from "./commands/center.js";
import { CommandStandardSize } from "./commands/standard-size.js";
import { CommandMinimize } from "./commands/minimize.js";

export { Command } from "./command.js";
export { CommandRegistry } from "./command-registry.js";

function init(reg: CommandRegistry): void {
  reg.add(new CommandCenterTwoThirds());
  reg.add(new CommandToggleFullscreen());
  reg.add(new CommandToggleMaximize());
  reg.add(new CommandMinimize());
  reg.add(new CommandLeftHalf());
  reg.add(new CommandRightHalf());
  reg.add(new CommandCenterHalf());
  reg.add(new CommandCenter());
  reg.add(new CommandStandardSize());
}

export function registry(): CommandRegistry {
  const reg = CommandRegistry.instance;

  init(reg);

  return reg;
}
