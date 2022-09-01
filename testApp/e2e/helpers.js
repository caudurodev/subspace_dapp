const TEST_PASSWORD = 'aaa123'

export const createDevAccount = async (page, extensionId) => {
  // Create dev //Alice account that can transact with local dev environment
  await page.goto(`chrome-extension://${extensionId}/index.html#/account/import-seed`)

  // public dev mnemonic for  //Alice account
  // more info here https://mirror.xyz/0x4659B666AC0e8D4c5D1B66eC5DCd57BAF2dA350B/bGFJYZhxBojZd0Dx6DEo8OifrJgIwNxwQ4CITWixUZw
  await page.locator('.seedInput textarea').fill('bottom drive obey lake curtain smoke basket hold race lonely fit walk')

  await page.locator('.advancedToggle').click()
  await page.locator('.derivationPath input').fill('//Alice')
  await page.locator('button:has-text("Next")').click()
  await page.locator('#root > main > div:nth-child(3) > div > input').fill('Alice Dev')
  // testPassword

  await page.locator('#root > main > div:nth-child(4) > div > input').fill(TEST_PASSWORD)
  await page.locator('#root > main > div:nth-child(5) > div > input').fill(TEST_PASSWORD)

  await page.locator('button:has-text("Add the account with the supplied seed")').click()
  await page.waitForURL(`chrome-extension://${extensionId}/index.html#/`)
  await page.locator('button:has-text("Understood, let me continue")').click()
}

export const authorizeURL = async (page, context, URL) => {
  // Authorize URL to be used with account
  const appPage = await context.newPage()
  await appPage.goto(URL)
  await appPage.waitForURL(URL)
  await appPage.bringToFront()
  await appPage.locator('text=Connect Wallet').click()
  await page.bringToFront()
  await page.locator('button:has-text("Yes, allow this application access")').click()

  await appPage.close()
}

export const authorizeTransaction = async (page, context, extensionId) => {
  // Authorize URL to be used with account
  const appPage = await context.newPage()
  await appPage.goto(`chrome-extension://${extensionId}/index.html#/`)
  await appPage.locator('#root > main > div.ButtonArea-sc-1254szc-0.gCQZqr.SignArea-sc-fme29r-0.ZEOwg > div:nth-child(1) > div > input').fill(TEST_PASSWORD)
  await appPage.locator('button:has-text("Sign the transaction")').click()
  await page.bringToFront()
}
