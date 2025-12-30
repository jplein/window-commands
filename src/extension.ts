import Gio from '@girs/gio-2.0';
import GLib from '@girs/glib-2.0';
import Meta from '@girs/meta-17';

const WINDOW_COMMANDS_IFACE = `
<node>
  <interface name="com.jasonplein.WindowCommands">
    <method name="CenterTwoThirds">
      <arg type="b" direction="out" name="success"/>
    </method>
  </interface>
</node>`;

class WindowCommandsDBus {
    private _dbusConnection: Gio.DBusConnection;
    private _registrationId: number | null = null;
    private _ownerId: number | null = null;

    constructor() {
        this._dbusConnection = Gio.DBus.session;

        const nodeInfo = Gio.DBusNodeInfo.new_for_xml(WINDOW_COMMANDS_IFACE);
        const ifaceInfo = nodeInfo.lookup_interface('com.jasonplein.WindowCommands');

        if (!ifaceInfo) {
            throw new Error('Failed to lookup DBus interface');
        }

        this._registrationId = this._dbusConnection.register_object(
            '/com/jasonplein/WindowCommands',
            ifaceInfo,
            (
                _connection: Gio.DBusConnection,
                _sender: string,
                _objectPath: string,
                _interfaceName: string,
                methodName: string,
                _parameters: unknown,
                invocation: Gio.DBusMethodInvocation
            ) => {
                if (methodName === 'CenterTwoThirds') {
                    const result = this.centerTwoThirds();
                    invocation.return_value(GLib.Variant.new('(b)', [result]));
                }
            },
            null,
            null
        );

        this._ownerId = this._dbusConnection.own_name(
            'com.jasonplein.WindowCommands',
            Gio.BusNameOwnerFlags.NONE,
            null,
            null
        );
    }

    centerTwoThirds(): boolean {
        try {
            const display = global.display;
            const window = display.focus_window;

            if (!window || window.window_type !== Meta.WindowType.NORMAL) {
                console.log('No valid window to resize');
                return false;
            }

            const workArea = window.get_work_area_current_monitor();

            // Calculate 2/3 width
            const newWidth = Math.floor(workArea.width * 2 / 3);
            const newHeight = workArea.height;

            // Center horizontally
            const newX = workArea.x + Math.floor((workArea.width - newWidth) / 2);
            const newY = workArea.y;

            // Unmaximize if needed
            if (window.is_maximized()) {
                window.unmaximize();
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
            this._dbusConnection.unown_name(this._ownerId);
            this._ownerId = null;
        }
        if (this._registrationId) {
            this._dbusConnection.unregister_object(this._registrationId);
            this._registrationId = null;
        }
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
