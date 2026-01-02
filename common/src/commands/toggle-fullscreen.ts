import { Command } from "../command.js";

export class CommandToggleFullscreen implements Command {
  public name = "ToggleFullscreen";

  public description = "Toggle fullscreen";

  icon = "view-fullscreen-symbolic";

  constructor() {}
}
