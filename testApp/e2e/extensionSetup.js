import path from 'path'
import { fileURLToPath } from 'url'
import { test as base, chromium } from '@playwright/test'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const extensionPath = path.join(__dirname, 'polkadot--js--extension')

export const test = base.extend({
  context: async ({ browserName }, use) => {
    const browserTypes = { chromium }
    const launchOptions = {
      devtools: false,
      headless: false,
      viewport: {
        width: 1440,
        height: 768,
      },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--remote-debugging-port=46666',
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    }
    const context = await browserTypes[browserName].launchPersistentContext('', launchOptions)
    await use(context)
    await context.close()
  },
  extensionId: async ({ context }, use) => {
    // for manifest v2:
    let [background] = context.backgroundPages()
    if (!background)
      background = await context.waitForEvent('backgroundpage')

    // for manifest v3:
    // let [background] = context.serviceWorkers()
    // if (!background)
    //   background = await context.waitForEvent('serviceworker')

    const extensionId = background.url().split('/')[2]
    await use(extensionId)
  },
})
