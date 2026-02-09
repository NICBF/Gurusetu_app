/**
 * Minimal store for 401 callback so api interceptor can trigger logout without importing React.
 */
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb;
}

export function triggerUnauthorized() {
  onUnauthorized?.();
}
