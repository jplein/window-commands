# Common bash commands

- npm run build: compile and bundle the project
- npm run lint: run the linter

# Output targets

- dist/extension.js: A GNOME Extension
- dist/cli.js: A command-line tool

# Organization

- extension.ts is the entry point for the GNOME extension
- cli.ts is the entry point for the command-line tool

The extension is run by GNOME, and cannot expect the Node standard library to exist. So the extension should not import the Node standard library.

 # Workflow

 After making any code changes, verify that npm run lint and npm run build finish without errors