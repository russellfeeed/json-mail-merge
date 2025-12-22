/**
 * Tool Selector E2E Tests
 * Tests for the main tool selector page functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Tool Selector Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display the tool selector page with header', async ({ page }) => {
    // Verify page title and header
    await expect(page).toHaveTitle(/Synertec Tools/);
    
    // Verify header elements
    await expect(page.locator('h1')).toHaveText('Synertec Tools');
    await expect(page.locator('p:has-text("Productivity tools for data transformation")')).toBeVisible();
    
    // Verify header icon is present
    await expect(page.locator('header svg')).toBeVisible();
  });

  test('should display available tools section', async ({ page }) => {
    // Verify section heading
    await expect(page.locator('h2:has-text("Available Tools")')).toBeVisible();
    await expect(page.locator('p:has-text("Select a tool to get started")')).toBeVisible();
  });

  test('should display JSON Data Merge tool card', async ({ page }) => {
    // Find the JSON Data Merge tool card
    const jsonMergeCard = page.locator('a[href="/json-merge"]');
    await expect(jsonMergeCard).toBeVisible();
    
    // Verify card content
    await expect(jsonMergeCard.locator('h3:has-text("JSON Data Merge")')).toBeVisible();
    await expect(jsonMergeCard.locator('p:has-text("Merge CSV data into JSON templates")')).toBeVisible();
    await expect(jsonMergeCard.locator('button:has-text("Open Tool")')).toBeVisible();
    
    // Verify card has proper styling and hover effects
    await expect(jsonMergeCard).toHaveClass(/group/);
  });

  test('should display "More Coming Soon" placeholder card', async ({ page }) => {
    // Find the placeholder card more specifically
    const placeholderCard = page.locator('div.border-dashed:has(h3:has-text("More Coming Soon"))');
    await expect(placeholderCard).toBeVisible();
    
    // Verify placeholder content
    await expect(placeholderCard.locator('h3:has-text("More Coming Soon")')).toBeVisible();
    await expect(placeholderCard.locator('p:has-text("Additional tools are in development")')).toBeVisible();
    
    // Verify disabled button
    const comingSoonButton = placeholderCard.locator('button:has-text("Coming Soon")');
    await expect(comingSoonButton).toBeVisible();
    await expect(comingSoonButton).toBeDisabled();
  });

  test('should navigate to JSON merge tool when card is clicked', async ({ page }) => {
    // Click on the JSON Data Merge tool card
    await page.locator('a[href="/json-merge"]').click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the JSON merge page
    expect(page.url()).toContain('/json-merge');
    
    // Verify JSON merge page elements are present
    await expect(page.locator('h1:has-text("JSON Data Merge")')).toBeVisible();
    await expect(page.locator('[data-tour="json-editor"]')).toBeVisible();
    await expect(page.locator('[data-tour="csv-editor"]')).toBeVisible();
  });

  test('should have proper responsive layout', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Verify grid layout is applied
    const toolGrid = page.locator('div.grid');
    await expect(toolGrid).toBeVisible();
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify layout still works on mobile
    await expect(toolGrid).toBeVisible();
    await expect(page.locator('a[href="/json-merge"]')).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Verify main landmark
    await expect(page.locator('main')).toBeVisible();
    
    // Verify header landmark
    await expect(page.locator('header')).toBeVisible();
    
    // Verify tool cards are properly linked
    const jsonMergeLink = page.locator('a[href="/json-merge"]');
    await expect(jsonMergeLink).toHaveAttribute('href', '/json-merge');
    
    // Verify buttons have proper attributes
    const comingSoonButton = page.locator('button:has-text("Coming Soon")');
    await expect(comingSoonButton).toHaveAttribute('disabled');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on the JSON merge tool card using keyboard
    await page.keyboard.press('Tab');
    
    // The first focusable element should be the JSON merge link
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('href', '/json-merge');
    
    // Press Enter to navigate
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    
    // Verify navigation worked
    expect(page.url()).toContain('/json-merge');
  });

  test('should have proper visual styling and branding', async ({ page }) => {
    // Verify header styling
    const header = page.locator('header');
    await expect(header).toHaveClass(/border-b/);
    await expect(header).toHaveClass(/bg-card/);
    
    // Verify tool cards have proper styling
    const jsonMergeCard = page.locator('a[href="/json-merge"]');
    await expect(jsonMergeCard).toHaveClass(/group/);
    
    // Verify icons are present - be more specific to avoid multiple matches
    await expect(page.locator('header svg').first()).toBeVisible(); // Header icon
    await expect(jsonMergeCard.locator('svg').first()).toBeVisible(); // Tool icon
    
    // Verify color scheme consistency
    const primaryElements = page.locator('.text-primary');
    expect(await primaryElements.count()).toBeGreaterThan(0);
  });

  test('should display correct tool count', async ({ page }) => {
    // Count available tool cards (excluding placeholder)
    const toolCards = page.locator('a[href^="/"]'); // Links that start with "/"
    const toolCount = await toolCards.count();
    
    // Should have exactly 1 available tool (JSON Data Merge)
    expect(toolCount).toBe(1);
    
    // Verify the tool is the JSON merge tool
    await expect(toolCards.first()).toHaveAttribute('href', '/json-merge');
  });

  test('should handle back navigation from tool page', async ({ page }) => {
    // Navigate to JSON merge tool
    await page.locator('a[href="/json-merge"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the tool page
    expect(page.url()).toContain('/json-merge');
    
    // Click the back button (should be in the header)
    await page.locator('a[title="Back to Tools"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify we're back on the tool selector
    expect(page.url()).not.toContain('/json-merge');
    await expect(page.locator('h1:has-text("Synertec Tools")')).toBeVisible();
  });

  test('should have proper meta information', async ({ page }) => {
    // Verify page has proper title
    await expect(page).toHaveTitle(/Synertec Tools/);
    
    // Verify main heading structure
    await expect(page.locator('h1')).toHaveText('Synertec Tools');
    await expect(page.locator('h2')).toHaveText('Available Tools');
    
    // Verify description text
    await expect(page.locator('p:has-text("Productivity tools")')).toBeVisible();
    await expect(page.locator('p:has-text("Select a tool to get started")')).toBeVisible();
  });
});