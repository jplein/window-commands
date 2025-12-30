# Window Commands GNOME Extension

A GNOME Shell extension that provides D-Bus methods for window management operations. Currently implements a `CenterTwoThirds` command that resizes the active window to 2/3 screen width and centers it.

## Features

- **CenterTwoThirds**: Resizes the active window to 2/3 of the display width, maximizes height, and centers horizontally
- D-Bus interface for easy command-line or script integration
- TypeScript-based development with full type checking

## Prerequisites

- GNOME Shell 45+ (tested on 49)
- Node.js and npm
- TypeScript

## Installation

### Quick Install

```bash
npm install
./install.sh
```

Then log out and log back in to GNOME.

### Manual Install

```bash
npm install
npm run build
mkdir -p ~/.local/share/gnome-shell/extensions/window-commands@jasonplein.com
cp dist/extension.js dist/metadata.json ~/.local/share/gnome-shell/extensions/window-commands@jasonplein.com/
gnome-extensions enable window-commands@jasonplein.com
```

Log out and log back in to GNOME for the extension to load.

### Nix/NixOS Installation

See [nix.md](nix.md) for detailed instructions on installing with home-manager or NixOS configuration.

## Usage

Once installed and enabled, use D-Bus to call the window commands:

```bash
# Center active window at 2/3 width
gdbus call --session --dest com.jasonplein.WindowCommands \
  --object-path /com/jasonplein/WindowCommands \
  --method com.jasonplein.WindowCommands.CenterTwoThirds
```

You can bind this to a keyboard shortcut using your desktop environment's settings.

### Adding to GNOME Launcher

You can create `.desktop` files to launch window commands from GNOME's Activities overview or application launcher.

Create a file at `~/.local/share/applications/window-center-two-thirds.desktop`:

```desktop
[Desktop Entry]
Type=Application
Name=Center Window (2/3 Width)
Comment=Center the active window at 2/3 screen width
Exec=gdbus call --session --dest com.jasonplein.WindowCommands --object-path /com/jasonplein/WindowCommands --method com.jasonplein.WindowCommands.CenterTwoThirds
Icon=view-grid-symbolic
Terminal=false
Categories=Utility;
NoDisplay=false
```

After creating the file, update the desktop database:

```bash
update-desktop-database ~/.local/share/applications/
```

The command will now appear when you search for "Center Window" in GNOME Activities.

#### Multiple Command Shortcuts

You can create multiple `.desktop` files for different commands. Here's a template:

```desktop
[Desktop Entry]
Type=Application
Name=Your Command Name
Comment=Description of what this command does
Exec=gdbus call --session --dest com.jasonplein.WindowCommands --object-path /com/jasonplein/WindowCommands --method com.jasonplein.WindowCommands.YourMethodName
Icon=preferences-system-windows-symbolic
Terminal=false
Categories=Utility;
NoDisplay=false
```

**Available icons** (from the Adwaita icon theme):
- `view-grid-symbolic` - Grid layout
- `preferences-system-windows-symbolic` - Window preferences
- `view-fullscreen-symbolic` - Fullscreen
- `window-maximize-symbolic` - Maximize
- `window-restore-symbolic` - Restore
- `view-restore-symbolic` - Restore view

Set `NoDisplay=true` if you want the command available via search but not shown in the application grid.

## Development

### Project Structure

```
window-commands/
├── src/
│   ├── extension.ts      # Main extension code
│   └── global.d.ts       # TypeScript ambient declarations
├── dist/                 # Build output (generated)
│   ├── extension.js
│   └── metadata.json
├── package.json          # Dependencies and build scripts
├── tsconfig.json         # TypeScript configuration
├── metadata.json         # GNOME extension metadata
└── install.sh           # Installation script
```

### Edit/Build/Test Workflow

#### 1. Make Your Changes

Edit [src/extension.ts](src/extension.ts) with your changes.

#### 2. Build

```bash
npm run build
```

This will:
- Run TypeScript compilation
- Generate [dist/extension.js](dist/extension.js)
- Copy [metadata.json](metadata.json) to dist/

#### 3. Install to Test

```bash
# Copy built files to extension directory
cp dist/extension.js dist/metadata.json ~/.local/share/gnome-shell/extensions/window-commands@jasonplein.com/

# Reload the extension (disable then enable)
gnome-extensions disable window-commands@jasonplein.com
gnome-extensions enable window-commands@jasonplein.com
```

**Important**: On Wayland, JavaScript file changes require logging out and back in. Simply disabling/enabling the extension won't reload the code.

#### 4. Test

```bash
# Check extension status
gnome-extensions info window-commands@jasonplein.com

# Test the command (focus a window first)
gdbus call --session --dest com.jasonplein.WindowCommands \
  --object-path /com/jasonplein/WindowCommands \
  --method com.jasonplein.WindowCommands.CenterTwoThirds
```

#### 5. Check for Errors

```bash
# Check extension errors
gdbus call --session --dest org.gnome.Shell.Extensions \
  --object-path /org/gnome/Shell/Extensions \
  --method org.gnome.Shell.Extensions.GetExtensionErrors \
  "window-commands@jasonplein.com"

# Check GNOME Shell logs
journalctl -b --no-pager | grep -i "window-commands"
```

### Quick Development Cycle

For rapid iteration:

1. Edit `src/extension.ts`
2. Run `npm run build && ./install.sh`
3. Log out and back in
4. Test your changes

### Using Watch Mode (TypeScript Only)

For TypeScript type-checking while editing:

```bash
npm run watch
```

Note: This only watches for TypeScript errors. You still need to build and reinstall to test.

## Adding Additional Commands

To add a new window command, follow these steps:

### Step 1: Update the D-Bus Interface

In [src/extension.ts](src/extension.ts), add your method to the `WINDOW_COMMANDS_IFACE` XML:

```typescript
const WINDOW_COMMANDS_IFACE = `
<node>
  <interface name="com.jasonplein.WindowCommands">
    <method name="CenterTwoThirds">
      <arg type="b" direction="out" name="success"/>
    </method>
    <!-- Add your new method here -->
    <method name="MaximizeVertically">
      <arg type="b" direction="out" name="success"/>
    </method>
  </interface>
</node>`;
```

### Step 2: Add the Method Handler

In the `WindowCommandsDBus` class constructor, add a handler for your method:

```typescript
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
        } else if (methodName === 'MaximizeVertically') {
            const result = this.maximizeVertically();
            invocation.return_value(GLib.Variant.new('(b)', [result]));
        }
    },
    null,
    null
);
```

### Step 3: Implement the Method

Add your implementation to the `WindowCommandsDBus` class:

```typescript
maximizeVertically(): boolean {
    try {
        const display = global.display;
        const window = display.focus_window;

        if (!window || window.window_type !== Meta.WindowType.NORMAL) {
            console.log('No valid window to resize');
            return false;
        }

        const workArea = window.get_work_area_current_monitor();

        // Keep current width, maximize height
        const currentRect = window.get_frame_rect();
        window.move_resize_frame(
            true,
            currentRect.x,
            workArea.y,
            currentRect.width,
            workArea.height
        );

        console.log('Maximized window vertically');
        return true;
    } catch (error) {
        console.error('Error in MaximizeVertically:', error);
        return false;
    }
}
```

### Step 4: Build and Test

```bash
npm run build
./install.sh
# Log out and back in
```

Test your new command:

```bash
gdbus call --session --dest com.jasonplein.WindowCommands \
  --object-path /com/jasonplein/WindowCommands \
  --method com.jasonplein.WindowCommands.MaximizeVertically
```

### Available Window Operations

The `window` object provides many useful methods:

- `window.move_resize_frame(user_op, x, y, width, height)` - Move and resize
- `window.maximize()` - Maximize window
- `window.unmaximize()` - Unmaximize window
- `window.minimize()` - Minimize window
- `window.is_maximized()` - Check if maximized
- `window.get_frame_rect()` - Get current position and size
- `window.get_work_area_current_monitor()` - Get available screen space
- `window.get_monitor()` - Get monitor index

For more details, see the [Meta.Window documentation](https://gjs-docs.gnome.org/meta13~13/meta.window).

## Available Scripts

- `npm run build` - Full build (type check + compile + copy metadata)
- `npm run compile` - Echo message (type checking done during bundle)
- `npm run bundle` - Compile TypeScript to JavaScript
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `./install.sh` - Build and install extension

## Troubleshooting

### Extension won't enable

Ensure user extensions are enabled:

```bash
gsettings get org.gnome.shell disable-user-extensions
```

If `true`, set to `false`:

```bash
gsettings set org.gnome.shell disable-user-extensions false
```

For NixOS/home-manager users, see [nix.md](nix.md) for proper configuration.

### Changes not taking effect

On Wayland, you **must** log out and log back in after updating the extension files. Simply disabling/enabling won't reload the JavaScript.

### Extension shows ERROR state

Check for errors:

```bash
gdbus call --session --dest org.gnome.Shell.Extensions \
  --object-path /org/gnome/Shell/Extensions \
  --method org.gnome.Shell.Extensions.GetExtensionErrors \
  "window-commands@jasonplein.com"
```

Check logs:

```bash
journalctl -b --no-pager | grep -i "window-commands"
```

### D-Bus service not found

Make sure the extension is enabled and running:

```bash
gnome-extensions info window-commands@jasonplein.com
```

Check if the D-Bus service is registered:

```bash
busctl --user list | grep -i window
```

## License

MIT (or specify your license)

## Contributing

Contributions welcome! Please ensure:

1. TypeScript compiles without errors
2. ESLint passes
3. Extension loads without errors
4. New features include documentation

## Resources

- [GNOME Shell Extensions Guide](https://gjs.guide/extensions/)
- [GJS Documentation](https://gjs-docs.gnome.org/)
- [Port Extensions to GNOME Shell 49](https://gjs.guide/extensions/upgrading/gnome-shell-49.html)
- [Meta.Window API](https://gjs-docs.gnome.org/meta13~13/meta.window)
