/**
 * Command metadata - no GNOME dependencies, safe to import in Node.js
 *
 * This file provides command information without requiring instantiation
 * of Command classes, which allows the CLI to access command names
 * without importing GNOME Shell types.
 */

export interface CommandMetadata {
    /** The DBus method name */
    name: string;
    /** Human-readable description */
    description?: string;
}

/**
 * Registry of all available commands
 * Add new commands here - they will be automatically picked up by both
 * the extension and the CLI
 */
export const COMMANDS_METADATA: CommandMetadata[] = [
    {
        name: 'CenterTwoThirds',
        description: 'Center window and resize to 2/3 screen width',
    },
    // Add more commands here as needed
];

/**
 * Get list of all command names
 */
export function getCommandNames(): string[] {
    return COMMANDS_METADATA.map(cmd => cmd.name);
}
