import Meta from "gi://Meta?version=17";
import { CommandImplementation } from "../command-implementation.js";

export class RightHalfCommand implements CommandImplementation {
  public name = "RightHalf";

  impl(): boolean {
    try {
      const display = global.display;
      const window = display.focus_window;

      if (!window || window.window_type !== Meta.WindowType.NORMAL) {
        console.log("No valid window to resize");
        return false;
      }

      const workArea = window.get_work_area_current_monitor();

      // Calculate right half
      const newWidth = Math.floor(workArea.width / 2);
      const newHeight = workArea.height;
      const newX = workArea.x + Math.floor(workArea.width / 2);
      const newY = workArea.y;

      // Unfullscreen if needed
      if (window.is_fullscreen()) {
        window.unmake_fullscreen();
      }

      // Unmaximize if needed
      if (window.is_maximized()) {
        window.unmaximize();
      }

      // Move and resize
      window.move_resize_frame(true, newX, newY, newWidth, newHeight);

      console.log(
        `Positioned window to right half: ${newWidth}x${newHeight} at (${newX}, ${newY})`,
      );
      return true;
    } catch (error) {
      console.error("Error in RightHalf:", error);
      return false;
    }
  }
}
