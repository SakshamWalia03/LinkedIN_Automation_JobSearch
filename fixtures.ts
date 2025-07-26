import { test as base } from "@playwright/test";
import fs from "fs-extra";
import dotenv from "dotenv";

dotenv.config();

const COOKIES_FILE = "linkedin_cookies.json";
const LINKEDIN_URL = "https://www.linkedin.com/jobs";

export const test = base.extend<{ pageWithAuth: any }>({
  pageWithAuth: async ({ page }, use) => {
    // Load cookies if available
    if (fs.existsSync(COOKIES_FILE)) {
      const cookies = await fs.readJson(COOKIES_FILE);
      await page.context().addCookies(cookies);
    }

    // Navigate to LinkedIn
    await page.goto(LINKEDIN_URL);

    // Check if already logged in
    if ((await page.locator('text="Me"').count()) === 0) {
      console.log("Cookies expired! Logging in again...");

      await page.fill('input[name="session_key"]', process.env.LINKEDIN_EMAIL);
      await page.fill(
        'input[name="session_password"]',
        process.env.LINKEDIN_PASSWORD
      );
      await page.click('button[type="submit"]');

      // Wait for successful login
      await page
        .locator('text="Me"')
        .waitFor({ state: "visible", timeout: 20000 });

      console.log("Login successful. Saving new cookies...");

      const cookies = await page.context().cookies();
      await fs.writeJson(COOKIES_FILE, cookies, { spaces: 2 });
    } else {
      console.log("Logged in using saved cookies!");
    }

    // Pass the authenticated page to the test
    await use(page);

    await page.close();
  },
});
