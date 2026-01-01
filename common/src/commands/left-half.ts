import { Command } from "../command.js";

export class CommandLeftHalf implements Command {
  public name = "LeftHalf";

  public description =
    "Position the window to occupy the left half of the screen";

  public icon = "view-dual-symbolic";

  constructor() {}
}
