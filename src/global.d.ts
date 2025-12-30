import '@girs/gnome-shell/ambient';
import '@girs/gnome-shell/extensions/global';

declare global {
    const console: {
        log(...args: unknown[]): void;
        error(...args: unknown[]): void;
        warn(...args: unknown[]): void;
        debug(...args: unknown[]): void;
    };
}
