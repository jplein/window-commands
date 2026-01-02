import Meta from "gi://Meta?version=17";
import { CommandImplementation } from "../command-implementation.js";

export class MinimizeCommand implements CommandImplementation {
  public name = "Minimize";

  impl(): boolean {
    try {
      const display = global.display;
      const window = display.focus_window;

      if (!window || window.window_type !== Meta.WindowType.NORMAL) {
        console.log("No valid window to minimize");
        return false;
      }

      window.minimize();
      console.log("Minimized window");

      return true;
    } catch (error) {
      console.error("Error in Minimize:", error);
      return false;
    }
  }
}
