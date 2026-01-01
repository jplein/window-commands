import { Command } from "../command.js";

export class CommandCenterTwoThirds implements Command {
  public name = "center-two-thirds";

  public description =
    "Set the width of the active window to two-thirds of the display, maximize height, and center it";

  constructor() {}
}
