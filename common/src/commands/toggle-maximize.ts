import { Command } from "../command.js";

export class CommandToggleMaximize implements Command {
  public name = "ToggleMaximize";

  public description = "Toggle maximize mode for the active window";

  icon = "window-maximize-symbolic";

  constructor() {}
}
