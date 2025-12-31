import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import { CommandRegistry } from "./CommandRegistry.js";

class WindowCommandsDBus {
  private _dbusConnection: Gio.DBusConnection;
  private _registrationId: number | null = null;
  private _ownerId: number | null = null;
  private _registry: CommandRegistry;

  constructor(registry: CommandRegistry) {
    this._dbusConnection = Gio.DBus.session;
    this._registry = registry;

    // Build DBus interface XML from registered commands
    const methods = this._registry
      .getNames()
      .map(
        (name) => `    <method name="${name}">
      <arg type="b" direction="out" name="success"/>
    </method>`,
      )
      .join("\n");

    const dbusInterface = `
<node>
  <interface name="com.jasonplein.WindowCommands">
${methods}
  </interface>
</node>`;

    const nodeInfo = Gio.DBusNodeInfo.new_for_xml(dbusInterface);
    const ifaceInfo = nodeInfo.lookup_interface(
      "com.jasonplein.WindowCommands",
    );

    if (!ifaceInfo) {
      throw new Error("Failed to lookup DBus interface");
    }

    this._registrationId = this._dbusConnection.register_object(
      "/com/jasonplein/WindowCommands",
      ifaceInfo,
      (
        _connection: Gio.DBusConnection,
        _sender: string,
        _objectPath: string,
        _interfaceName: string,
        methodName: string,
        _parameters: unknown,
        invocation: Gio.DBusMethodInvocation,
      ) => {
        const command = this._registry.get(methodName);
        if (command) {
          const result = command.handle();
          invocation.return_value(GLib.Variant.new("(b)", [result]));
        } else {
          console.error(`Unknown method: ${methodName}`);
          invocation.return_value(GLib.Variant.new("(b)", [false]));
        }
      },
      null,
      null,
    );

    this._ownerId = this._dbusConnection.own_name(
      "com.jasonplein.WindowCommands",
      Gio.BusNameOwnerFlags.NONE,
      null,
      null,
    );
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

// GNOME Shell 45+ requires a default export of a class with enable/disable methods
export default class WindowCommandsExtension {
  private _dbus: WindowCommandsDBus | null = null;
  private _registry: CommandRegistry | null = null;

  enable() {
    console.log("Enabling Window Commands extension");

    // Create registry with all commands
    this._registry = CommandRegistry.instance;

    this._dbus = new WindowCommandsDBus(this._registry);
  }

  disable() {
    console.log("Disabling Window Commands extension");
    if (this._dbus) {
      this._dbus.destroy();
      this._dbus = null;
    }
  }
}

export const registry = CommandRegistry.instance;
