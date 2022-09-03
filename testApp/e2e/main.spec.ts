import { expect } from '@playwright/test'
import { test } from './extensionSetup.js'
import { authorizeTransaction, authorizeURL, createDevAccount } from './helpers.js'

// TODO
// replace beforeEach with beforeAll so as to only create dev account wallet once
// must take into account different polkadot extension states after each test and include
// exceptions for auth screens

test.beforeEach(async ({ page, extensionId, context }) => {
  await createDevAccount(page, extensionId)
  await authorizeURL(page, context, extensionId, 'http://localhost:3333/')
  await page.locator('[data-test="wallet-connect-btn"]').click()
})

test.describe('Happy Flow', () => {
  test('Connect Wallet to pre-existing //Alice dev account and authorize URL', async ({ page, context, extensionId }) => {
    await expect(page.locator('[data-test="wallet-connect-btn"]')).toContainText('Connected:')
    await expect(page.locator('[data-test="wallet-username"]')).toContainText('Alice Dev')
  })

  test.only('Upload and share image', async ({ page, context, extensionId }) => {
    await expect(page.locator('[data-test="wallet-connect-btn"]')).toContainText('Connected:')
    await expect(page.locator('[data-test="wallet-username"]')).toContainText('Alice Dev')

    // upload a file
    await page.locator('[data-test="upload-image-input"]').setInputFiles('./e2e/index.jpg')

    await authorizeTransaction(page, context, extensionId)

    await page.locator('[data-test="image-share-btn"]').click()
    await expect(page).toHaveURL(new RegExp('^http://localhost:3333/img/'))
  })
})
