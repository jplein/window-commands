import { Command } from "../command.js";

export class CommandMinimize implements Command {
  public name = "Minimize";

  public description = "Minimize";

  icon = "window-minimize-symbolic";

  constructor() {}
}
