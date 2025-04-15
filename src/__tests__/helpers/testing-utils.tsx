/**
 * Helper utilities for testing async component behaviors
 */
import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

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

/**
 * Test wrapper component that provides necessary mocks for tests
 */
export const TestWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  );
};

// Add a test to make Jest happy
describe('TestWrapper component', () => {
  test('renders children properly', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <div>Test Child</div>
      </TestWrapper>
    );
    expect(getByTestId('test-wrapper')).toBeInTheDocument();
  });
}); 