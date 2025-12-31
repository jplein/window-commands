#!/usr/bin/env bash
# Install script for window-commands GNOME extension

EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/window-commands@jasonplein.com"

# Build the extension
npm run build

# Remove old installation
rm -rf "$EXTENSION_DIR"

# Create extension directory
mkdir -p "$EXTENSION_DIR"

# Copy extension files
cp dist/extension.js "$EXTENSION_DIR/"
cp dist/metadata.json "$EXTENSION_DIR/"

echo "Extension installed to: $EXTENSION_DIR"
echo ""
echo "To enable the extension, run:"
echo "  gnome-extensions enable window-commands@jasonplein.com"
echo ""
echo "Then restart GNOME Shell:"
echo "  - On X11: Press Alt+F2, type 'r', press Enter"
echo "  - On Wayland: Log out and log back in"
echo ""
echo "To test the D-Bus command:"
echo "  gdbus call --session --dest com.jasonplein.WindowCommands \\"
echo "    --object-path /com/jasonplein/WindowCommands \\"
echo "    --method com.jasonplein.WindowCommands.CenterTwoThirds"
