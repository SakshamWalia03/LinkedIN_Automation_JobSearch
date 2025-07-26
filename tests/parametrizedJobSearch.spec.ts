import { test } from "../fixtures";
import fs from "fs";
import { LinkedInJobPage } from "../Pages/LinkedInJobPage";

const JOB_TITLES = ["Testers", "QA Engineer"];
const JOBS_FILE_PREFIX = "linkedin_jobs";

test.describe("LinkedIn Job Search", () => {
  test.setTimeout(30 * 1000);

  JOB_TITLES.forEach((jobTitle) => {
    test(`Searching jobs for '${jobTitle}'`, async ({ pageWithAuth }) => {
      const linkedInJobPage = new LinkedInJobPage(pageWithAuth);

      console.log(`Searching for jobs: '${jobTitle}'`);
      await linkedInJobPage.searchJob(jobTitle);

      const jobData = await linkedInJobPage.getJobListings(5,jobTitle);

      // Save job data with a dynamic file name
      const fileName = `${JOBS_FILE_PREFIX}_${jobTitle.replace(/\s+/g, "_")}.csv`;
      console.log(`Saving job data to ${fileName}...`);
      fs.writeFileSync(fileName, jobData);
      
      console.log(`Job details for '${jobTitle}' saved to '${fileName}'`);
    });
  });
});