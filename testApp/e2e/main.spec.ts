import { expect } from '@playwright/test'
import { test } from './extensionSetup.js'
import { authorizeTransaction, authorizeURL, createDevAccount } from './helpers.js'

test.beforeAll(async ({ page, extensionId, context }) => {
  await createDevAccount(page, extensionId)
  await authorizeURL(page, context, 'http://localhost:3333/')

  // reset page to wallet disconnected for tests
  await page.goto('http://localhost:3333')
})

test.describe('Happy Flow', () => {
  test('Connect Wallet to preexisting //Alice account', async ({ page }) => {
    await page.goto('http://localhost:3333')
    await expect(page).toHaveURL('http://localhost:3333/')

    await expect(page.locator('[data-test="wallet-connect-btn"]')).toContainText('Connect Wallet')
    await page.locator('[data-test="wallet-connect-btn"]').click()
    await expect(page.locator('[data-test="wallet-connect-btn"]')).toContainText('Connected:')
    await expect(page.locator('[data-test="wallet-username"]')).toContainText('Alice Dev'.toUpperCase())
  })

  test.only('Upload and share image', async ({ page, context, extensionId }) => {
    await page.goto('http://localhost:3333')
    await expect(page).toHaveURL('http://localhost:3333/')
    await expect(page.locator('[data-test="wallet-connect-btn"]')).toContainText('Connect Wallet')
    await page.locator('[data-test="wallet-connect-btn"]').click()

    // upload a file
    await page.locator('[data-test="upload-image-input"]').setInputFiles('./e2e/index.jpg')

    await authorizeTransaction(page, context, extensionId)

    await page.pause()

    //   // Upload index.jpg
    // await page1.locator('[data-test="upload-image-input"]').setInputFiles('index.jpg');
    // // Open new page
    // const page3 = await context.newPage();
    // await page3.goto('chrome-extension://mkdkbldmjhbfkpoaekddlngmmgbcnmbe/notification.html');
    // // Go to chrome-extension://mkdkbldmjhbfkpoaekddlngmmgbcnmbe/notification.html#/
    // await page3.goto('chrome-extension://mkdkbldmjhbfkpoaekddlngmmgbcnmbe/notification.html#/');

    // wait for file to become available

    // navigate to share link
  })

  test('Open shared image url', async ({ page }) => {
    await page.goto('http://localhost:3333')
    await expect(page).toHaveURL('http://localhost:3333/')

    // navigate to share link
  })
})
