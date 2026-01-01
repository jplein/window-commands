# Complete flake example showing how to use window-commands as a flake input
#
# This is a complete working example of a home-manager flake configuration
# that includes window-commands.

{
  description = "Example home-manager configuration with window-commands";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    window-commands = {
      url = "github:jplein/window-commands/jplein/nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, home-manager, window-commands, ... }: {
    homeConfigurations = {
      # Replace "youruser" with your actual username
      "youruser" = home-manager.lib.homeManagerConfiguration {
        pkgs = nixpkgs.legacyPackages.x86_64-linux;

        modules = [
          # Import the window-commands home-manager module
          window-commands.homeManagerModules.default

          # Your home-manager configuration
          {
            # Required for home-manager standalone
            home.username = "youruser";
            home.homeDirectory = "/home/youruser";
            home.stateVersion = "24.11";

            # Enable window-commands
            programs.window-commands = {
              enable = true;
              # Optionally override the package:
              # package = window-commands.packages.x86_64-linux.default;
            };

            # Enable the GNOME extension
            dconf.settings = {
              "org/gnome/shell" = {
                enabled-extensions = [
                  "window-commands@jasonplein.com"
                ];
              };
            };

            # Optional: Configure keyboard shortcuts for commands
            # Example: Bind Super+Shift+C to center window at 2/3 width
            dconf.settings."org/gnome/settings-daemon/plugins/media-keys" = {
              custom-keybindings = [
                "/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/center-two-thirds/"
                "/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/toggle-maximize/"
              ];
            };

            dconf.settings."org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/center-two-thirds" = {
              binding = "<Super><Shift>c";
              command = "jplein-window-commands CenterTwoThirds";
              name = "Center Window (2/3 width)";
            };

            dconf.settings."org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/toggle-maximize" = {
              binding = "<Super>m";
              command = "jplein-window-commands ToggleMaximize";
              name = "Toggle Maximize Window";
            };
          }
        ];
      };
    };
  };
}
