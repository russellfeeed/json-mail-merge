/**
 * Coverage collection utilities for E2E tests
 * Provides functions to collect and extract coverage data from the running application
 */

import { Page } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface CoverageData {
  url: string;
  ranges: Array<{
    start: number;
    end: number;
    count: number;
  }>;
  text: string;
}

export interface V8Coverage {
  result: Array<{
    scriptId: string;
    url: string;
    functions: Array<{
      functionName: string;
      ranges: Array<{
        startOffset: number;
        endOffset: number;
        count: number;
      }>;
    }>;
  }>;
}

export class CoverageHelpers {
  private static coverageData: CoverageData[] = [];
  private static isCollecting = false;

  /**
   * Start collecting coverage data from the browser
   */
  static async startCoverage(page: Page): Promise<void> {
    if (this.isCollecting) {
      return;
    }

    try {
      // Only enable coverage for Chromium-based browsers
      const browserName = page.context().browser()?.browserType().name();
      if (browserName !== 'chromium') {
        console.log(`Coverage collection not supported for ${browserName}, skipping`);
        return;
      }

      // Enable runtime and profiler domains for coverage collection
      const client = await page.context().newCDPSession(page);
      await client.send('Runtime.enable');
      await client.send('Profiler.enable');
      
      // Start precise coverage collection
      await client.send('Profiler.startPreciseCoverage', {
        callCount: true,
        detailed: true
      });

      this.isCollecting = true;
      console.log('Coverage collection started successfully');
    } catch (error) {
      console.warn('Failed to start coverage collection:', error);
      this.isCollecting = false;
    }
  }

  /**
   * Stop collecting coverage and extract data
   */
  static async stopCoverage(page: Page): Promise<CoverageData[]> {
    if (!this.isCollecting) {
      console.log('Coverage collection was not started, skipping stop');
      return [];
    }

    try {
      // Only process coverage for Chromium-based browsers
      const browserName = page.context().browser()?.browserType().name();
      if (browserName !== 'chromium') {
        console.log(`Coverage collection not supported for ${browserName}, skipping`);
        this.isCollecting = false;
        return [];
      }

      const client = await page.context().newCDPSession(page);
      
      // Get the coverage data
      const coverage = await client.send('Profiler.takePreciseCoverage') as V8Coverage;
      
      // Stop coverage collection
      await client.send('Profiler.stopPreciseCoverage');
      await client.send('Profiler.disable');
      await client.send('Runtime.disable');

      this.isCollecting = false;

      // Process coverage data
      const processedCoverage: CoverageData[] = [];
      
      for (const entry of coverage.result) {
        // Only include application source files (exclude node_modules, test files, etc.)
        if (this.shouldIncludeInCoverage(entry.url)) {
          // Get the source text
          let sourceText = '';
          try {
            const source = await client.send('Runtime.getScriptSource', {
              scriptId: entry.scriptId
            });
            sourceText = source.scriptSource || '';
          } catch (error) {
            console.warn(`Failed to get source for ${entry.url}:`, error);
            continue;
          }

          // Convert function ranges to coverage ranges
          const ranges: Array<{ start: number; end: number; count: number }> = [];
          
          for (const func of entry.functions) {
            for (const range of func.ranges) {
              ranges.push({
                start: range.startOffset,
                end: range.endOffset,
                count: range.count
              });
            }
          }

          processedCoverage.push({
            url: entry.url,
            ranges,
            text: sourceText
          });
        }
      }

      this.coverageData.push(...processedCoverage);
      console.log(`Coverage collection stopped, processed ${processedCoverage.length} files`);
      return processedCoverage;
    } catch (error) {
      console.warn('Failed to collect coverage data:', error);
      this.isCollecting = false;
      return [];
    }
  }

  /**
   * Save coverage data to file for later merging
   */
  static async saveCoverageData(testName: string): Promise<void> {
    if (this.coverageData.length === 0) {
      return;
    }

    const coverageDir = join(process.cwd(), 'coverage', 'e2e');
    
    // Ensure coverage directory exists
    if (!existsSync(coverageDir)) {
      mkdirSync(coverageDir, { recursive: true });
    }

    // Save coverage data as JSON
    const coverageFile = join(coverageDir, `${testName}-${Date.now()}.json`);
    const coverageJson = {
      timestamp: new Date().toISOString(),
      testName,
      coverage: this.coverageData
    };

    try {
      writeFileSync(coverageFile, JSON.stringify(coverageJson, null, 2));
      console.log(`Coverage data saved to: ${coverageFile}`);
    } catch (error) {
      console.warn('Failed to save coverage data:', error);
    }
  }

  /**
   * Clear collected coverage data
   */
  static clearCoverageData(): void {
    this.coverageData = [];
  }

  /**
   * Get all collected coverage data
   */
  static getCoverageData(): CoverageData[] {
    return [...this.coverageData];
  }

  /**
   * Determine if a URL should be included in coverage collection
   */
  private static shouldIncludeInCoverage(url: string): boolean {
    // Only include local application files
    if (!url.startsWith('http://localhost:') && !url.startsWith('http://127.0.0.1:')) {
      return false;
    }

    // Exclude common non-application files
    const excludePatterns = [
      '/node_modules/',
      '/@vite/',
      '/@fs/',
      '/src/vite-env.d.ts',
      '/src/main.tsx', // Entry point typically not tested
      '.test.',
      '.spec.',
      '/coverage/',
      '/dist/',
      '/build/',
      '/__vite_ping',
      '/favicon.ico',
      '.css',
      '.svg',
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.woff',
      '.woff2',
      '.ttf',
      '.eot'
    ];

    return !excludePatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Convert V8 coverage to Istanbul format for compatibility
   */
  static convertToIstanbulFormat(coverageData: CoverageData[]): any {
    const istanbulCoverage: any = {};

    for (const entry of coverageData) {
      // Extract file path from URL
      const url = new URL(entry.url);
      let filePath = url.pathname;
      
      // Convert URL path to local file path
      if (filePath.startsWith('/src/')) {
        filePath = filePath.substring(1); // Remove leading slash
      }

      // Create Istanbul-compatible coverage object
      const lines: { [key: number]: number } = {};
      const functions: { [key: string]: { name: string; line: number; hit: number } } = {};
      const branches: { [key: string]: number[] } = {};
      const statements: { [key: number]: number } = {};

      // Process ranges to extract line coverage
      const sourceLines = entry.text.split('\n');
      let currentLine = 1;
      let currentChar = 0;

      // Initialize all lines as uncovered
      for (let i = 1; i <= sourceLines.length; i++) {
        lines[i] = 0;
        statements[i] = 0;
      }

      // Mark covered lines based on ranges
      for (const range of entry.ranges) {
        if (range.count > 0) {
          // Find which lines this range covers
          let charCount = 0;
          for (let lineNum = 1; lineNum <= sourceLines.length; lineNum++) {
            const lineLength = sourceLines[lineNum - 1].length + 1; // +1 for newline
            
            if (charCount + lineLength > range.start && charCount < range.end) {
              lines[lineNum] = Math.max(lines[lineNum], range.count);
              statements[lineNum] = Math.max(statements[lineNum], range.count);
            }
            
            charCount += lineLength;
            if (charCount > range.end) break;
          }
        }
      }

      istanbulCoverage[filePath] = {
        path: filePath,
        statementMap: {},
        fnMap: functions,
        branchMap: branches,
        s: statements,
        f: {},
        b: {},
        l: lines,
        inputSourceMap: null
      };
    }

    return istanbulCoverage;
  }
}