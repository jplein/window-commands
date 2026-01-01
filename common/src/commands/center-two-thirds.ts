import { Command } from "../command.js";

export class CommandCenterTwoThirds implements Command {
  public name = "CenterTwoThirds";

  public description =
    "Center active window and set width to 2/3 of the screen";

  icon = "sidebar-show-symbolic";

  constructor() {}
}
