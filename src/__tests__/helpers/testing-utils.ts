/**
 * Helper utilities for testing async component behaviors
 */

/**
 * Wait for a short delay to allow async operations to complete
 * Useful for tests where normal waitFor might be flaky
 */
export const delay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Flush all pending promises and timers
 * Useful for testing components with multiple async operations
 */
export const flushPromises = async () => {
  // Wait for all promises to resolve
  await Promise.resolve();
  // Wait for any timers
  await delay();
};

// Add a test to make Jest happy
describe('Testing utilities', () => {
  test('delay function should return a promise', () => {
    expect(delay()).toBeInstanceOf(Promise);
  });
}); 