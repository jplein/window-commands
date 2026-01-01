import { Command } from "../command.js";

export class CommandCenterTwoThirds implements Command {
  public name = "center-two-thirds";

  public description =
    "Center active window and set width to 2/3 of the screen";

  constructor() {}
}
