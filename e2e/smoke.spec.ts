import { test, expect } from '@playwright/test'

test.describe('Flow 1: Define schema → add entry → verify on data page', () => {
  test('creates a schema, adds an entry, sees it on data page', async ({ page }) => {
    await page.goto('/')

    // Expand schema editor
    await page.click('button[aria-expanded]')

    // Add a field
    await page.click('button:has-text("Add field")')

    // Fill in field name
    const nameInputs = page.locator('input[placeholder="field name"]')
    await nameInputs.first().fill('title')

    // Close editor (collapse)
    await page.click('button[aria-expanded]')

    // Fill in the entry form
    await page.locator('input[type="text"]').first().fill('My first entry')

    // Add entry
    await page.click('button:has-text("Add entry")')

    // Navigate to data page
    await page.click('a[href="/data"]')

    // Verify entry appears
    await expect(page.locator('td')).toContainText('My first entry')
  })
})

test.describe('Flow 2: Add entry → edit it → verify persists after reload', () => {
  test('edits an entry and the change persists after page reload', async ({ page }) => {
    await page.goto('/')

    // Build a simple schema with one field
    await page.click('button[aria-expanded]')
    await page.click('button:has-text("Add field")')
    const nameInput = page.locator('input[placeholder="field name"]').first()
    await nameInput.fill('note')
    await page.click('button[aria-expanded]')

    // Add entry
    await page.locator('input[type="text"]').first().fill('original value')
    await page.click('button:has-text("Add entry")')

    // Go to data page and enable edit mode
    await page.click('a[href="/data"]')
    await page.click('button:has-text("Edit mode")')

    // Click edit (pencil) button for first row
    await page.click('button[title="Edit entry"]')

    // Edit the staged form
    await page.locator('.fixed input[type="text"]').first().fill('edited value')

    // Save
    await page.click('button:has-text("Save changes")')

    // Wait for the table to reflect the edit (drawer closed, value updated in-memory)
    await expect(page.locator('td').first()).toContainText('edited value')

    // Ensure a small delay for IDB transaction to complete and flush
    await page.waitForTimeout(1000)

    // Reload and verify persistence
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('td').first()).toContainText('edited value')
  })
})

test.describe('Flow 3: One of each field type → export as JSON', () => {
  test('defines a schema with multiple types and exports as JSON', async ({ page }) => {
    await page.goto('/')

    // Build schema with several field types
    await page.click('button[aria-expanded]')

    // Add a string field
    await page.click('button:has-text("Add field")')
    await page.locator('input[placeholder="field name"]').last().fill('name')

    // Add a number field
    await page.click('button:has-text("Add field")')
    const lastRow = page.locator('input[placeholder="field name"]').last()
    await lastRow.fill('score')
    // Change type to number
    await page.locator('select').last().selectOption('number')

    await page.click('button[aria-expanded]')

    // Fill and submit
    await page.locator('input[type="text"]').first().fill('Alice')
    await page.locator('input[type="number"]').first().fill('42')
    await page.click('button:has-text("Add entry")')

    // Navigate to data page where the entries Export lives
    await page.click('a[href="/data"]')

    // Click Export → dialog appears → choose "Field names" to trigger download
    await page.locator('main').getByRole('button', { name: 'Export', exact: true }).click()
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Field names")'),
    ])

    const stream = await download.createReadStream()
    let content = ''
    for await (const chunk of stream) {
      content += chunk.toString()
    }

    const parsed = JSON.parse(content)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed.length).toBeGreaterThan(0)
  })
})
