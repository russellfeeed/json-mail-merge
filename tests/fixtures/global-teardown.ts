/**
 * Global teardown for Playwright tests
 * Ensures cleanup of coverage sessions and other resources
 */

import { CoverageHelpers } from './coverage-helpers';

async function globalTeardown() {
  console.log('Running global teardown...');
  
  try {
    // Cleanup any remaining coverage sessions
    await CoverageHelpers.cleanupAllSessions();
    console.log('Coverage sessions cleaned up successfully');
  } catch (error) {
    console.warn('Failed to cleanup coverage sessions:', error);
  }
}

export default globalTeardown;