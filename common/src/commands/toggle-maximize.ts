import { Command } from "../command.js";

export class CommandToggleMaximize implements Command {
  public name = "ToggleMaximize";

  public description = "Toggle maximize";

  icon = "window-maximize-symbolic";

  constructor() {}
}
