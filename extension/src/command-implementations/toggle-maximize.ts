import Meta from "gi://Meta?version=17";
import { CommandImplementation } from "../command-implementation.js";

export class ToggleMaximizeCommand implements CommandImplementation {
  public name = "ToggleMaximize";

  impl(): boolean {
    try {
      const display = global.display;
      const window = display.focus_window;

      if (!window || window.window_type !== Meta.WindowType.NORMAL) {
        console.log("No valid window to toggle maximize");
        return false;
      }

      if (window.is_maximized()) {
        window.unmaximize();
        console.log("Unmaximized window");
      } else {
        window.maximize();
        console.log("Maximized window");
      }

      return true;
    } catch (error) {
      console.error("Error in ToggleMaximize:", error);
      return false;
    }
  }
}
