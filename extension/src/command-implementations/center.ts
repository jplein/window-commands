import Meta from "gi://Meta?version=17";
import { CommandImplementation } from "../command-implementation.js";

export class CenterCommand implements CommandImplementation {
  public name = "Center";

  impl(): boolean {
    try {
      const display = global.display;
      const window = display.focus_window;

      if (!window || window.window_type !== Meta.WindowType.NORMAL) {
        console.log("No valid window to center");
        return false;
      }

      const workArea = window.get_work_area_current_monitor();
      const frame = window.get_frame_rect();

      // Keep current size
      const newWidth = frame.width;
      const newHeight = frame.height;

      // Center the window
      const newX = workArea.x + Math.floor((workArea.width - newWidth) / 2);
      const newY = workArea.y + Math.floor((workArea.height - newHeight) / 2);

      // Unfullscreen if needed
      if (window.is_fullscreen()) {
        window.unmake_fullscreen();
      }

      // Always unmaximize to clear any tiled/maximized state
      window.unmaximize();

      // Move window to center
      window.move_resize_frame(true, newX, newY, newWidth, newHeight);

      console.log(
        `Centered window at (${newX}, ${newY}) with size ${newWidth}x${newHeight}`,
      );
      return true;
    } catch (error) {
      console.error("Error in Center:", error);
      return false;
    }
  }
}
