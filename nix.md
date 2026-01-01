# Installing window-commands Extension with Nix

This guide explains how to install the window-commands GNOME extension and CLI using NixOS or home-manager.

## Prerequisites

- NixOS or home-manager installed
- GNOME Shell desktop environment
- Node.js and npm (for building)

## Option 1: Using Nix Flakes (Recommended)

### Using as a Flake Input

Add window-commands to your flake inputs in your `flake.nix`:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    home-manager.url = "github:nix-community/home-manager";
    home-manager.inputs.nixpkgs.follows = "nixpkgs";

    window-commands = {
      url = "github:jplein/window-commands/jplein/nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, home-manager, window-commands, ... }: {
    homeConfigurations."youruser" = home-manager.lib.homeManagerConfiguration {
      pkgs = nixpkgs.legacyPackages.x86_64-linux;
      modules = [
        # Import the window-commands home-manager module
        window-commands.homeManagerModules.default

        # Your home-manager configuration
        {
          programs.window-commands.enable = true;

          # Enable the GNOME extension
          dconf.settings = {
            "org/gnome/shell" = {
              enabled-extensions = [
                "window-commands@jasonplein.com"
              ];
            };
          };
        }
      ];
    };
  };
}
```

### Using with nixpkgs.follows

The flake is designed to follow your nixpkgs input, ensuring package consistency:

```nix
window-commands = {
  url = "github:jplein/window-commands/jplein/nix";
  inputs.nixpkgs.follows = "nixpkgs";
};
```

### Using a Local Path

During development, you can use a local path:

```nix
window-commands.url = "path:/path/to/window-commands";
```

### Using the Package Directly

You can also just use the package without the home-manager module:

```nix
{
  outputs = { self, nixpkgs, window-commands, ... }: {
    homeConfigurations."youruser" = home-manager.lib.homeManagerConfiguration {
      # ...
      modules = [{
        home.packages = [ window-commands.packages.x86_64-linux.default ];
      }];
    };
  };
}
```

### Running the CLI with nix run

You can run the CLI tool without installing it:

```bash
nix run github:jplein/window-commands/jplein/nix -- --help
nix run github:jplein/window-commands/jplein/nix -- --list
nix run github:jplein/window-commands/jplein/nix -- CenterTwoThirds
```

## Option 2: Using the home-manager module (Non-Flakes)

The project includes a complete home-manager module that handles:
- Building the project
- Installing the GNOME Shell extension
- Installing the CLI tool as `jplein-window-commands`
- Generating .desktop files for all commands

### Step 1: Import the module

In your `~/.config/home-manager/home.nix`:

```nix
{ config, pkgs, ... }:

{
  imports = [
    /path/to/window-commands/home-manager-module.nix
  ];

  # Enable the window-commands extension and CLI
  programs.window-commands = {
    enable = true;
  };

  # Enable the GNOME extension
  dconf.settings = {
    "org/gnome/shell" = {
      enabled-extensions = [
        "window-commands@jasonplein.com"
      ];
    };
  };
}
```

See [home-manager-example.nix](./home-manager-example.nix) for a complete example with keyboard shortcut configuration.

### Step 2: Apply the configuration

```bash
home-manager switch
```

### Step 3: Using the CLI

After installation, you can use the CLI tool:

```bash
# List all available commands
jplein-window-commands --list

# Execute a command
jplein-window-commands CenterTwoThirds

# Show help
jplein-window-commands --help
```

The .desktop files are automatically installed, making the commands available in your application launcher and for keyboard shortcuts.

## Option 3: Manual home-manager setup (Advanced)

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

## Option 4: Using NixOS configuration

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

## Option 5: Local Development (No Packaging)

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
