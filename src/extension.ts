import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

const WINDOW_COMMANDS_IFACE = `
<node>
  <interface name="com.jasonplein.WindowCommands">
    <method name="CenterTwoThirds">
      <arg type="b" direction="out" name="success"/>
    </method>
  </interface>
</node>`;

class WindowCommandsDBus {
    private _dbusImpl: Gio.DBusExportedObject;
    private _ownerId: number | null = null;

    constructor() {
        const nodeInfo = Gio.DBusNodeInfo.new_for_xml(WINDOW_COMMANDS_IFACE);
        const ifaceInfo = nodeInfo.interfaces[0];

        this._dbusImpl = Gio.DBusExportedObject.wrapJSObject(ifaceInfo, this);
        this._dbusImpl.export(Gio.DBus.session, '/com/jasonplein/WindowCommands');

        this._ownerId = Gio.DBus.session.own_name(
            'com.jasonplein.WindowCommands',
            Gio.BusNameOwnerFlags.NONE,
            null,
            null
        );
    }

    CenterTwoThirds(): boolean {
        try {
            const display = global.display;
            const window = display.focus_window;

            if (!window || window.window_type !== Meta.WindowType.NORMAL) {
                console.log('No valid window to resize');
                return false;
            }

            const monitor = display.get_monitor_geometry(window.get_monitor());
            const workArea = window.get_work_area_current_monitor();

            // Calculate 2/3 width
            const newWidth = Math.floor(workArea.width * 2 / 3);
            const newHeight = workArea.height;

            // Center horizontally
            const newX = workArea.x + Math.floor((workArea.width - newWidth) / 2);
            const newY = workArea.y;

            // Unmaximize if needed
            if (window.get_maximized()) {
                window.unmaximize(Meta.MaximizeFlags.BOTH);
            }

            // Move and resize
            window.move_resize_frame(true, newX, newY, newWidth, newHeight);

            console.log(`Resized window to 2/3 width: ${newWidth}x${newHeight} at (${newX}, ${newY})`);
            return true;
        } catch (error) {
            console.error('Error in CenterTwoThirds:', error);
            return false;
        }
    }

    destroy() {
        if (this._ownerId) {
            Gio.DBus.session.unown_name(this._ownerId);
            this._ownerId = null;
        }
        this._dbusImpl.unexport();
    }
}

let windowCommandsDBus: WindowCommandsDBus | null = null;

export function enable() {
    console.log('Enabling Window Commands extension');
    windowCommandsDBus = new WindowCommandsDBus();
}

export function disable() {
    console.log('Disabling Window Commands extension');
    if (windowCommandsDBus) {
        windowCommandsDBus.destroy();
        windowCommandsDBus = null;
    }
}
