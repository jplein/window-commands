import { Command } from "../command.js";

export class CommandCenterHalf implements Command {
  public name = "CenterHalf";

  public description =
    "Position the window to occupy the center half of the screen";

  public icon = "view-dual-symbolic";

  constructor() {}
}
