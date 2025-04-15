/**
 * Logger Utility Module
 * 
 * A simple logging utility that respects the DEBUG environment variable.
 * This module provides functions for logging messages at different levels,
 * while controlling their visibility based on the environment configuration.
 * 
 * In production environments, only error logs are shown by default, while
 * debug, info, and warning logs are only displayed when DEBUG=true.
 */

/**
 * Determines if debug mode is enabled.
 * 
 * Reads the DEBUG environment variable from process.env
 * which should be defined in the .env file.
 * 
 * @returns {boolean} True if DEBUG=true, false otherwise
 */
const isDebugMode = () => {
  return process.env.DEBUG === 'true';
};

/**
 * Debug-aware console.log function.
 * 
 * Prints messages to the console only when DEBUG=true.
 * Use this for general debug information during development.
 * 
 * @param {...any} args - Arguments to pass to console.log
 * @returns {void}
 * @example
 * // Only logs when DEBUG=true
 * log('Initializing component', componentId);
 */
export const log = (...args: any[]) => {
  if (isDebugMode()) {
    console.log(...args);
  }
};

/**
 * Error logging function.
 * 
 * Always prints error messages regardless of DEBUG setting.
 * Use this for critical errors that should always be logged.
 * 
 * @param {...any} args - Arguments to pass to console.error
 * @returns {void}
 * @example
 * // Always logs, regardless of DEBUG setting
 * error('Failed to connect to database', err);
 */
export const error = (...args: any[]) => {
  console.error(...args);
};

/**
 * Debug-aware console.warn function.
 * 
 * Prints warning messages to the console only when DEBUG=true.
 * Use this for non-critical warnings during development.
 * 
 * @param {...any} args - Arguments to pass to console.warn
 * @returns {void}
 * @example
 * // Only logs when DEBUG=true
 * warn('Deprecated function used', functionName);
 */
export const warn = (...args: any[]) => {
  if (isDebugMode()) {
    console.warn(...args);
  }
};

/**
 * Debug-aware console.info function.
 * 
 * Prints informational messages to the console only when DEBUG=true.
 * Use this for general informational messages during development.
 * 
 * @param {...any} args - Arguments to pass to console.info
 * @returns {void}
 * @example
 * // Only logs when DEBUG=true
 * info('User logged in', userId);
 */
export const info = (...args: any[]) => {
  if (isDebugMode()) {
    console.info(...args);
  }
}; 