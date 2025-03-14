/**
 * Extracts job information from the current page
 * This is a heuristic approach that works for many job sites
 */
export function extractJobInfo(): { companyName: string; position: string; description: string } {
  // Default values
  let companyName = 'Unknown Company';
  let position = 'Unknown Position';
  let description = '';

  // Try to extract the job title
  const possibleTitleElements = document.querySelectorAll('h1, h2, .job-title, [data-testid="jobsearch-JobInfoHeader-title"]');
  for (const element of Array.from(possibleTitleElements)) {
    const text = element.textContent?.trim();
    if (text && text.length > 0 && text.length < 100) {
      position = text;
      break;
    }
  }

  // Try to extract the company name
  const possibleCompanyElements = document.querySelectorAll('.company-name, [data-testid="jobsearch-JobInfoHeader-companyName"], .employer, .organization');
  for (const element of Array.from(possibleCompanyElements)) {
    const text = element.textContent?.trim();
    if (text && text.length > 0 && text.length < 50) {
      companyName = text;
      break;
    }
  }

  // Try to extract the job description
  const possibleDescriptionElements = document.querySelectorAll('.job-description, [data-testid="jobDescriptionText"], .description, #job-details');
  for (const element of Array.from(possibleDescriptionElements)) {
    const text = element.textContent?.trim();
    if (text && text.length > 100) {
      description = text;
      break;
    }
  }

  // If we couldn't find a description, try to get all text from the page
  if (!description) {
    // Get all text from the page body, excluding scripts and styles
    const bodyText = document.body.innerText;
    // Find the largest paragraph of text
    const paragraphs = bodyText.split('\n\n');
    let largestParagraph = '';
    for (const paragraph of paragraphs) {
      if (paragraph.length > largestParagraph.length && paragraph.length > 100) {
        largestParagraph = paragraph;
      }
    }
    description = largestParagraph || 'No description found';
  }

  return {
    companyName,
    position,
    description,
  };
} 