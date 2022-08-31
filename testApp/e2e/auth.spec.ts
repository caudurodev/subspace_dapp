// import { extensionTest } from './extensionSetup'
import { expect } from '@playwright/test'
import { test } from './extensionSetup.js'

test.beforeAll(async ({ page, extensionId, context }) => {
  // Create dev Alice account that can transact with local dev environment
  await page.goto(`chrome-extension://${extensionId}/index.html#/account/import-seed`)
  // dev mnemonic for  //Alice account
  // more infor here https://mirror.xyz/0x4659B666AC0e8D4c5D1B66eC5DCd57BAF2dA350B/bGFJYZhxBojZd0Dx6DEo8OifrJgIwNxwQ4CITWixUZw
  await page.locator('.seedInput textarea').fill('bottom drive obey lake curtain smoke basket hold race lonely fit walk')
  await page.locator('.advancedToggle').click()
  await page.locator('.derivationPath input').fill('//Alice')
  await page.locator('button:has-text("Next")').click()
  await page.locator('#root > main > div:nth-child(3) > div > input').fill('Alice test')
  await page.locator('#root > main > div:nth-child(4) > div > input').fill('aaa123')
  await page.locator('#root > main > div:nth-child(5) > div > input').fill('aaa123')
  await page.locator('button:has-text("Add the account with the supplied seed")').click()
  await page.waitForURL(`chrome-extension://${extensionId}/index.html#/`)
  await page.locator('button:has-text("Understood, let me continue")').click()

  // Authorize URL to be used with account
  const appPage = await context.newPage()
  await appPage.goto('http://localhost:3333/')
  await appPage.waitForURL('http://localhost:3333/')
  await appPage.bringToFront()
  await appPage.locator('text=Connect Polkadot Wallet Jeff').click()
  await page.bringToFront()
  await page.locator('button:has-text("Yes, allow this application access")').click()

  await appPage.close()
  // return to original page
  await page.goto('http://localhost:3333')
})

test.describe('Auth', () => {
  test('Creates new user', async ({ page }) => {
    await expect(page).toHaveURL('http://localhost:3333/')
  })
})
