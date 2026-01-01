export interface Command {
  // The name of the command. This is an internal identifier, which must be
  // unique.
  name: string;

  // A description of the command. This will appear in the .desktop file's
  // Comment entry and in the CLI's command list. */
  description?: string;

  // The command's implementation, to be filled in by the extension
  impl?: () => void;
}
