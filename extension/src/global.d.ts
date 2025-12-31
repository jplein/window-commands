/// <reference types="@girs/gnome-shell/ambient" />
/// <reference types="@girs/gnome-shell/extensions/global" />

import type Shell from '@girs/shell-17';

declare global {
    // Override Node's global with GNOME Shell's global
    const global: Shell.Global;

    const console: {
        log(...args: unknown[]): void;
        error(...args: unknown[]): void;
        warn(...args: unknown[]): void;
        debug(...args: unknown[]): void;
    };
}
