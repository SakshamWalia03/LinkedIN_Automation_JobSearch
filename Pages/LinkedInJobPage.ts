import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class LinkedInJobPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToJobs() {
    console.log("Navigating to LinkedIn Jobs...");
    await this.page.goto("https://www.linkedin.com/jobs/");
  }

  async searchJob(keyword: string) {
    console.log(`Searching for '${keyword}'...`);
    await this.page.fill(
      'input[aria-label="Search by title, skill, or company"]',
      keyword
    );
    await this.page.press(
      'input[aria-label="Search by title, skill, or company"]',
      "Enter"
    );

    // Ensure job listings are visible before proceeding
    await this.page.waitForSelector(".job-card-container", { timeout: 10000 });
  }

  async getJobListings(
    limit: number = 5,
    searchedKeyword: string
  ): Promise<string> {
    const jobLocators = this.page.locator(".job-card-container");
    const jobCount = await jobLocators.count();
    console.log(`Found ${jobCount} job listings.`);

    if (jobCount === 0) {
      throw new Error("No job listings found.");
    }

    console.log(`Extracting job listings for ${searchedKeyword}...`);
    let csvContent = `"Job Title","Company","Location","Date Posted","Job Link"\n`;

    for (let i = 0; i < limit; i++) {
      await jobLocators.nth(i).click();

      // Ensure job details are loaded
      await this.page.waitForTimeout(2000);
      expect(
        await this.page.locator(
          ".job-details-jobs-unified-top-card__primary-description-container"
        )
      ).toContainText(/applicant|clicked/);

      // Extract job details safely
      const jobTitle = await this.page
        .locator(".job-details-jobs-unified-top-card__job-title")
        .textContent();
      const company = await this.page
        .locator(".job-details-jobs-unified-top-card__company-name")
        .textContent();
      const details: string[] = (
        await this.page
          .locator(
            ".job-details-jobs-unified-top-card__primary-description-container"
          )
          .innerText()
      ).split("·");

      const location = details[0]?.trim() || "N/A";
      const datePosted = details[1]?.trim() || "N/A";
      const link: string =
        (await this.page
          .locator(".job-details-jobs-unified-top-card__job-title a")
          .getAttribute("href")) || "N/A";

      csvContent += `"${jobTitle?.trim()}","${company?.trim()}","${location}","${datePosted}","https://www.linkedin.com${link}"\n`;
    }

    return csvContent;
  }
}
