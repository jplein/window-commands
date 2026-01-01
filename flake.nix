{
  description = "GNOME extension and CLI for window management commands";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        window-commands = pkgs.buildNpmPackage rec {
          pname = "window-commands";
          version = "1.0.0";

          src = ./.;

          # This hash will need to be updated when dependencies change
          # To update: set to empty string, run build, use hash from error message
          npmDepsHash = "sha256-UMX2ii7/FAxsxqogC75UpTPTGIeQ9a/42yv857aWlg4=";

          # The build script is already defined in package.json
          npmBuildScript = "build";

          installPhase = ''
            runHook preInstall

            mkdir -p $out/bin
            mkdir -p $out/share/gnome-shell/extensions/window-commands@jasonplein.com
            mkdir -p $out/share/applications

            # Install GNOME Shell extension
            cp dist/extension.js $out/share/gnome-shell/extensions/window-commands@jasonplein.com/
            cp dist/metadata.json $out/share/gnome-shell/extensions/window-commands@jasonplein.com/

            # Install CLI tool with proper name
            cp dist/cli.js $out/bin/jplein-window-commands
            chmod +x $out/bin/jplein-window-commands

            # Generate .desktop files using the CLI tool
            ${pkgs.nodejs}/bin/node $out/bin/jplein-window-commands --generate-desktop $out/share/applications

            # Fix the Exec paths in the generated .desktop files
            # The CLI tool generates: Exec=node /path/to/cli.js CommandName
            # We want: Exec=/nix/store/.../bin/jplein-window-commands CommandName
            for desktop_file in $out/share/applications/window-commands-*.desktop; do
              if [ -f "$desktop_file" ]; then
                sed -i "s|^Exec=node .*/cli\.js|Exec=$out/bin/jplein-window-commands|g" "$desktop_file"
              fi
            done

            runHook postInstall
          '';

          meta = with pkgs.lib; {
            description = "GNOME extension and CLI for window management commands";
            homepage = "https://github.com/jplein/window-commands";
            license = licenses.mit;
            platforms = platforms.linux;
            maintainers = [ ];
          };
        };

      in {
        packages = {
          default = window-commands;
          window-commands = window-commands;
        };

        apps.default = {
          type = "app";
          program = "${window-commands}/bin/jplein-window-commands";
        };
      }
    ) // {
      # Home Manager module (system-independent)
      homeManagerModules.default = { config, lib, pkgs, ... }:
        let
          cfg = config.programs.window-commands;

          # Allow overriding with a custom package or use the one from the flake
          window-commands-pkg = cfg.package;
        in {
          options.programs.window-commands = {
            enable = lib.mkEnableOption "window-commands GNOME extension and CLI";

            package = lib.mkOption {
              type = lib.types.package;
              default = self.packages.${pkgs.system}.default;
              defaultText = lib.literalExpression "inputs.window-commands.packages.\${pkgs.system}.default";
              description = "The window-commands package to use";
            };
          };

          config = lib.mkIf cfg.enable {
            # Add the CLI tool to the user's PATH
            home.packages = [ window-commands-pkg ];

            # Install the GNOME Shell extension
            home.file.".local/share/gnome-shell/extensions/window-commands@jasonplein.com" = {
              source = "${window-commands-pkg}/share/gnome-shell/extensions/window-commands@jasonplein.com";
              recursive = true;
            };

            # Install desktop files
            xdg.dataFile = lib.listToAttrs (
              map (desktop: {
                name = "applications/${baseNameOf desktop}";
                value = {
                  source = desktop;
                };
              }) (lib.filesystem.listFilesRecursive "${window-commands-pkg}/share/applications")
            );
          };
        };

      # Overlay for adding the package to pkgs
      overlays.default = final: prev: {
        window-commands = self.packages.${prev.system}.default;
      };
    };
}
