#!/usr/bin/env node

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function centerTwoThirds(): Promise<boolean> {
    try {
        const { stdout } = await execAsync(
            'gdbus call --session --dest com.jasonplein.WindowCommands --object-path /com/jasonplein/WindowCommands --method com.jasonplein.WindowCommands.CenterTwoThirds'
        );

        const result = stdout.trim();
        console.log('Command executed:', result);
        return result.includes('true');
    } catch (error) {
        console.error('Error calling WindowCommands extension:', error);
        return false;
    }
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === 'center-two-thirds') {
        const success = await centerTwoThirds();
        process.exit(success ? 0 : 1);
    } else {
        console.error('Unknown command:', args[0]);
        console.error('Usage: window-commands [center-two-thirds]');
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
