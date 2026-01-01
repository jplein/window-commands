import { exec } from "node:child_process";
import { promisify } from "node:util";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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
function generateDesktopFile(command: Command, targetDir: string): void {
  mkdirSync(targetDir, { recursive: true });

  const { name, icon } = command;

  var iconLine = "";
  if (icon) {
    iconLine = `Icon=${icon}\n`;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const cliPath = resolve(__dirname, "cli.js");

  let desktopContent = `[Desktop Entry]
Type=Application
Name=${name}
Exec=node ${cliPath} ${name}
Terminal=false
Categories=Utility;
NoDisplay=false
${iconLine}`;

  const desktopFilePath = join(targetDir, `window-commands-${name}.desktop`);
  writeFileSync(desktopFilePath, desktopContent);
  console.log(`Created desktop file: ${desktopFilePath}`);
}

/**
 * Generate .desktop files for all commands
 */
function generateAllDesktopFiles(commands: Command[], targetDir: string): void {
  console.log(`Generating desktop files for ${commands.length} commands...`);

  for (const methodName of commands) {
    generateDesktopFile(methodName, targetDir);
  }

  console.log(`Done! Desktop files created in ${targetDir}`);
  console.log(`You may need to run: update-desktop-database ${targetDir}`);
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
      "  window-commands --generate-desktop <dir> Generate .desktop files",
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
    const targetDir = args[1];
    if (!targetDir) {
      console.error("Error: --generate-desktop requires a directory path");
      console.error("Usage: window-commands --generate-desktop <dir>");
      process.exit(1);
    }
    const commands = registry().list();
    generateAllDesktopFiles(commands, resolve(targetDir));
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
