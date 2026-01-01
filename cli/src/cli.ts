import { exec } from "node:child_process";
import { promisify } from "node:util";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { registry, CommandRegistry, Command } from "window-commands-common";

const execAsync = promisify(exec);

/**
 * Execute a window command via DBus
 */
async function executeCommand(command: Command): Promise<boolean> {
  const methodName = command.name;

  try {
    const { stdout } = await execAsync(
      `gdbus call --session --dest com.jasonplein.WindowCommands --object-path /com/jasonplein/WindowCommands --method com.jasonplein.WindowCommands.${methodName}`,
    );

    const result = stdout.trim();
    console.log("Command executed:", result);
    return result.includes("true");
  } catch (error) {
    console.error(`Error calling ${methodName}:`, error);
    return false;
  }
}

/**
 * Generate a .desktop file for a command
 */
function generateDesktopFile(command: Command): void {
  const desktopDir = join(homedir(), ".local/share/applications");
  mkdirSync(desktopDir, { recursive: true });

  const { name, description } = command;

  const cliPath = join(process.cwd(), resolve(__dirname, "../../dist/cli.js"));

  const desktopContent = `[Desktop Entry]
Type=Application
Name=${description}
Exec=node ${cliPath} ${name}
Terminal=false
Categories=Utility;
NoDisplay=false
`;

  const desktopFilePath = join(desktopDir, `window-commands-${name}.desktop`);
  writeFileSync(desktopFilePath, desktopContent);
  console.log(`Created desktop file: ${desktopFilePath}`);
}

/**
 * Generate .desktop files for all commands
 */
function generateAllDesktopFiles(commands: Command[]): void {
  console.log(`Generating desktop files for ${commands.length} commands...`);

  for (const methodName of commands) {
    generateDesktopFile(methodName);
  }

  console.log("Done! Desktop files created in ~/.local/share/applications/");
  console.log(
    "You may need to run: update-desktop-database ~/.local/share/applications/",
  );
}

/**
 * List all available commands
 */
function listCommands(registry: CommandRegistry): void {
  console.log("Available commands:");
  for (const command of registry.list()) {
    console.log(`  ${command.name} (${command.description})`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log("Usage:");
    console.log("  window-commands <command-name>          Execute a command");
    console.log("  window-commands --list                  List all commands");
    console.log(
      "  window-commands --generate-desktop      Generate .desktop files",
    );
    console.log("  window-commands --help                  Show this help");
    process.exit(0);
  }

  const param = args[0];

  if (param === "--list") {
    listCommands(registry());
    process.exit(0);
  }

  if (param === "--generate-desktop") {
    const commands = registry().list();
    generateAllDesktopFiles(commands);
    process.exit(0);
  }

  // Execute the command
  const command = registry().get(param);
  if (!command) {
    console.error(`Unknown command: ${param}`);
    console.error('Run "window-commands --list" to see available commands');
    process.exit(1);
  }

  const success = await executeCommand(command);
  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
