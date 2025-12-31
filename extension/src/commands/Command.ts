/**
 * Base interface for all window management commands
 */
export interface Command {
    /**
     * The DBus method name for this command (e.g., "CenterTwoThirds")
     */
    name(): string;

    /**
     * Execute the command
     * @returns true if successful, false otherwise
     */
    handle(): boolean;
}
