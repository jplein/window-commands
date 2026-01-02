import { Command } from "../command.js";

export class CommandMinimize implements Command {
  public name = "Minimize";

  public description = "Minimize the active window";

  icon = "window-minimize-symbolic";

  constructor() {}
}
