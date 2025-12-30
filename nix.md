# Installing window-commands Extension with Nix

This guide explains how to install the window-commands GNOME extension using NixOS or home-manager.

## Prerequisites

- NixOS or home-manager installed
- GNOME Shell desktop environment
- Node.js and npm (for building)

## Option 1: Using home-manager (Recommended)

### Step 1: Create a Nix package

Create a file `~/.config/nixpkgs/gnome-extensions/window-commands.nix`:

```nix
{ stdenv, lib, fetchFromGitHub, nodejs, gnome }:

stdenv.mkDerivation rec {
  pname = "gnome-shell-extension-window-commands";
  version = "1.0.0";

  src = ./.;  # Or use fetchFromGitHub if pulling from a repo

  nativeBuildInputs = [ nodejs ];

  buildPhase = ''
    npm install
    npm run build
  '';

  installPhase = ''
    mkdir -p $out/share/gnome-shell/extensions/window-commands@jasonplein.com
    cp dist/extension.js $out/share/gnome-shell/extensions/window-commands@jasonplein.com/
    cp dist/metadata.json $out/share/gnome-shell/extensions/window-commands@jasonplein.com/
  '';

  meta = with lib; {
    description = "D-Bus interface for window management commands";
    license = licenses.mit;  # Adjust to your license
    maintainers = [ ];
    platforms = platforms.linux;
  };
}
```

### Step 2: Add to home-manager configuration

In your `~/.config/home-manager/home.nix`:

```nix
{ config, pkgs, ... }:

{
  # Enable GNOME extensions
  programs.gnome-shell = {
    enable = true;

    # Install the extension
    extensions = [
      (pkgs.callPackage ./gnome-extensions/window-commands.nix { })
    ];
  };

  # IMPORTANT: Allow user extensions to load
  dconf.settings = {
    "org/gnome/shell" = {
      disable-user-extensions = false;
      enabled-extensions = [
        "window-commands@jasonplein.com"
      ];
    };
  };
}
```

### Step 3: Apply the configuration

```bash
home-manager switch
```

After applying, log out and log back in to GNOME for the extension to load.

## Option 2: Using NixOS configuration

In your `/etc/nixos/configuration.nix`:

```nix
{ config, pkgs, ... }:

let
  window-commands-extension = pkgs.callPackage ./path/to/window-commands.nix { };
in
{
  # Install the extension system-wide
  environment.systemPackages = [
    window-commands-extension
  ];

  # Configure GNOME to allow user extensions
  programs.dconf.profiles.user.databases = [{
    settings = {
      "org/gnome/shell" = {
        disable-user-extensions = false;
        enabled-extensions = [
          "window-commands@jasonplein.com"
        ];
      };
    };
  }];
}
```

Apply with:
```bash
sudo nixos-rebuild switch
```

## Option 3: Local Development (No Packaging)

If you're actively developing the extension, you can use a simpler approach:

```nix
{ config, pkgs, ... }:

{
  # Just ensure user extensions are enabled
  dconf.settings = {
    "org/gnome/shell" = {
      disable-user-extensions = false;
      enabled-extensions = [
        "window-commands@jasonplein.com"
      ];
    };
  };
}
```

Then manually install the extension:
```bash
./install.sh
```

## Verifying Installation

After installing and logging back in, verify the extension is active:

```bash
gnome-extensions info window-commands@jasonplein.com
```

You should see `State: ACTIVE` or `State: ENABLED`.

Test the D-Bus command:

```bash
gdbus call --session --dest com.jasonplein.WindowCommands \
  --object-path /com/jasonplein/WindowCommands \
  --method com.jasonplein.WindowCommands.CenterTwoThirds
```

## Troubleshooting

### Extension shows as "OUT OF DATE"

Make sure your `metadata.json` includes your GNOME Shell version in the `shell-version` array.

### Extension won't enable

Check that `disable-user-extensions` is set to `false`:

```bash
gsettings get org.gnome.shell disable-user-extensions
```

If it returns `true`, apply the dconf settings above and run `home-manager switch`.

### Extension shows error state

On Wayland, you must log out and log back in after installing or updating the extension. Simply enabling/disabling is not sufficient.

Check for errors:
```bash
gdbus call --session --dest org.gnome.Shell.Extensions \
  --object-path /org/gnome/Shell/Extensions \
  --method org.gnome.Shell.Extensions.GetExtensionErrors \
  "window-commands@jasonplein.com"
```

Check GNOME Shell logs:
```bash
journalctl -b --no-pager | grep -i "window-commands"
```
