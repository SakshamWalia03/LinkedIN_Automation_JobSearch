import { test } from "../fixtures";
import fs from "fs";
import { LinkedInJobPage } from "../Pages/LinkedInJobPage";

const SEARCH_KEYWORD = "Software Developer";
const JOBS_FILE = "linkedin_jobs.csv";

test("Automate LinkedIn Job Search", async ({ pageWithAuth }) => {
  test.setTimeout(2 * 60 * 1000);
  const linkedInJobPage = new LinkedInJobPage(pageWithAuth);

  await linkedInJobPage.searchJob(SEARCH_KEYWORD);
  const jobData = await linkedInJobPage.getJobListings(10, `${SEARCH_KEYWORD}`);

  console.log("Saving job data to CSV...");
  fs.writeFileSync(JOBS_FILE, jobData);
  console.log(`Job details saved to '${JOBS_FILE}'`);
});
