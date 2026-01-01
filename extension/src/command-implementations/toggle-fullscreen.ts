import Meta from "gi://Meta?version=17";
import { CommandImplementation } from "../command-implementation.js";

export class ToggleFullscreenCommand implements CommandImplementation {
  public name = "ToggleFullscreen";

  impl(): boolean {
    try {
      const display = global.display;
      const window = display.focus_window;

      if (!window || window.window_type !== Meta.WindowType.NORMAL) {
        console.log("No valid window to toggle fullscreen");
        return false;
      }

      if (window.is_fullscreen()) {
        window.unmake_fullscreen();
        console.log("Exited fullscreen mode");
      } else {
        window.make_fullscreen();
        console.log("Entered fullscreen mode");
      }

      return true;
    } catch (error) {
      console.error("Error in ToggleFullscreen:", error);
      return false;
    }
  }
}
