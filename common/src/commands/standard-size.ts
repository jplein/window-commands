import { Command } from "../command.js";

export class CommandStandardSize implements Command {
  public name = "StandardSize";

  public description =
    "Center the window and resize it to two-thirds the width and height of the screen";

  icon = "focus-windows-symbolic";

  constructor() {}
}
