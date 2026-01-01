export interface Command {
  // The name of the command. This is an internal identifier, which must be
  // unique.
  name: string;

  // A description of the command. This is the help string in the command-line
  // tools '--list' output.
  description: string;

  // The command's implementation, to be filled in by the extension
  impl?: () => boolean;
}
