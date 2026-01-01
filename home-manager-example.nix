# Example home-manager configuration using the window-commands module
#
# This file shows how to integrate the window-commands GNOME extension
# and CLI tool into your home-manager configuration.

{ config, pkgs, ... }:

{
  # Import the window-commands home-manager module
  imports = [
    ./home-manager-module.nix
  ];

  # Enable the window-commands extension and CLI
  programs.window-commands = {
    enable = true;
    # Optionally override the package if needed:
    # package = pkgs.window-commands.override { ... };
  };

  # After enabling, you will have:
  # 1. The GNOME Shell extension installed at:
  #    ~/.local/share/gnome-shell/extensions/window-commands@jasonplein.com
  #
  # 2. The CLI tool available as: jplein-window-commands
  #    Try: jplein-window-commands --help
  #    Try: jplein-window-commands --list
  #    Try: jplein-window-commands CenterTwoThirds
  #
  # 3. Desktop files for all commands in:
  #    ~/.local/share/applications/window-commands-*.desktop
  #
  # To enable the GNOME extension after installation:
  #   gnome-extensions enable window-commands@jasonplein.com
  #
  # Or use dconf to enable it programmatically:
  dconf.settings = {
    "org/gnome/shell" = {
      enabled-extensions = [
        "window-commands@jasonplein.com"
      ];
    };
  };

  # You may also want to bind the commands to keyboard shortcuts:
  # dconf.settings = {
  #   "org/gnome/settings-daemon/plugins/media-keys" = {
  #     custom-keybindings = [
  #       "/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/center-two-thirds/"
  #     ];
  #   };
  #   "org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/center-two-thirds" = {
  #     binding = "<Super><Shift>c";
  #     command = "jplein-window-commands CenterTwoThirds";
  #     name = "Center Window (2/3 width)";
  #   };
  # };
}
