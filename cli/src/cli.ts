#!/usr/bin/env node

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const execAsync = promisify(exec);

// Hard-coded list of commands - must match what's registered in extension
const COMMANDS = ['CenterTwoThirds'];

/**
 * Convert a DBus method name to kebab-case (e.g., CenterTwoThirds -> center-two-thirds)
 */
function toKebabCase(methodName: string): string {
    return methodName
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .substring(1);
}

/**
 * Convert kebab-case to DBus method name (e.g., center-two-thirds -> CenterTwoThirds)
 */
function toMethodName(commandName: string): string {
    return commandName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

/**
 * Execute a window command via DBus
 */
async function executeCommand(methodName: string): Promise<boolean> {
    try {
        const { stdout } = await execAsync(
            `gdbus call --session --dest com.jasonplein.WindowCommands --object-path /com/jasonplein/WindowCommands --method com.jasonplein.WindowCommands.${methodName}`
        );

        const result = stdout.trim();
        console.log('Command executed:', result);
        return result.includes('true');
    } catch (error) {
        console.error(`Error calling ${methodName}:`, error);
        return false;
    }
}

/**
 * Generate a .desktop file for a command
 */
function generateDesktopFile(methodName: string): void {
    const desktopDir = join(homedir(), '.local/share/applications');
    mkdirSync(desktopDir, { recursive: true });

    const kebabName = toKebabCase(methodName);
    const displayName = methodName.replace(/([A-Z])/g, ' $1').trim();
    const cliPath = join(process.cwd(), 'cli/dist/cli.js');

    const desktopContent = `[Desktop Entry]
Type=Application
Name=Window: ${displayName}
Exec=node ${cliPath} ${kebabName}
Terminal=false
Categories=Utility;
NoDisplay=false
`;

    const desktopFilePath = join(desktopDir, `window-commands-${kebabName}.desktop`);
    writeFileSync(desktopFilePath, desktopContent);
    console.log(`Created desktop file: ${desktopFilePath}`);
}

/**
 * Generate .desktop files for all commands
 */
function generateAllDesktopFiles(): void {
    console.log(`Generating desktop files for ${COMMANDS.length} commands...`);

    for (const methodName of COMMANDS) {
        generateDesktopFile(methodName);
    }

    console.log('Done! Desktop files created in ~/.local/share/applications/');
    console.log('You may need to run: update-desktop-database ~/.local/share/applications/');
}

/**
 * List all available commands
 */
function listCommands(): void {
    console.log('Available commands:');
    for (const methodName of COMMANDS) {
        const kebabName = toKebabCase(methodName);
        console.log(`  ${kebabName} (${methodName})`);
    }
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        console.log('Usage:');
        console.log('  window-commands <command-name>          Execute a command');
        console.log('  window-commands --list                  List all commands');
        console.log('  window-commands --generate-desktop      Generate .desktop files');
        console.log('  window-commands --help                  Show this help');
        process.exit(0);
    }

    const command = args[0];

    if (command === '--list') {
        listCommands();
        process.exit(0);
    }

    if (command === '--generate-desktop') {
        generateAllDesktopFiles();
        process.exit(0);
    }

    // Execute the command
    const methodName = toMethodName(command);
    if (!COMMANDS.includes(methodName)) {
        console.error(`Unknown command: ${command}`);
        console.error('Run "window-commands --list" to see available commands');
        process.exit(1);
    }

    const success = await executeCommand(methodName);
    process.exit(success ? 0 : 1);
}

main().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
