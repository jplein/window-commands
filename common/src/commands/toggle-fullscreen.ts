import { Command } from "../command.js";

export class CommandToggleFullscreen implements Command {
  public name = "ToggleFullscreen";

  public description = "Toggle fullscreen mode for the active window";

  icon = "view-fullscreen-symbolic";

  constructor() {}
}
