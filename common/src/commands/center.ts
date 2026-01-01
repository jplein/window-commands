import { Command } from "../command.js";

export class CommandCenter implements Command {
  public name = "Center";

  public description = "Center the window without resizing it";

  icon = "focus-windows-symbolic";

  constructor() {}
}
