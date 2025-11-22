import puppeteer from 'puppeteer';
import fs from 'fs/promises';

async function scrapeEvents() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('Navigating to Princeton events page...');
    await page.goto('https://my.princeton.edu/events', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for events to load
    console.log('Waiting for events to load...');
    await page.waitForTimeout(5000); // Give time for dynamic content

    // Extract event data
    const events = await page.evaluate(() => {
      const eventElements = document.querySelectorAll('[class*="event"], [class*="Event"], .card, [data-testid*="event"]');
      const results = [];

      eventElements.forEach((element, index) => {
        try {
          // Try to extract common event information patterns
          const event = {
            id: `event_${Date.now()}_${index}`,
            name: null,
            location: null,
            datetime: null,
            host_organization: null,
            rsvp_list: [],
            tags: [],
            cover_image: null,
            description: null
          };

          // Look for event name
          const titleSelectors = ['h1', 'h2', 'h3', 'h4', '[class*="title"]', '[class*="Title"]', '[class*="name"]'];
          for (const selector of titleSelectors) {
            const titleEl = element.querySelector(selector);
            if (titleEl && titleEl.textContent.trim()) {
              event.name = titleEl.textContent.trim();
              break;
            }
          }

          // Look for location
          const locationSelectors = ['[class*="location"]', '[class*="Location"]', '[class*="venue"]', '[class*="Venue"]'];
          for (const selector of locationSelectors) {
            const locEl = element.querySelector(selector);
            if (locEl && locEl.textContent.trim()) {
              event.location = locEl.textContent.trim();
              break;
            }
          }

          // Look for datetime
          const dateSelectors = ['[class*="date"]', '[class*="Date"]', '[class*="time"]', '[class*="Time"]', 'time'];
          for (const selector of dateSelectors) {
            const dateEl = element.querySelector(selector);
            if (dateEl) {
              event.datetime = dateEl.textContent.trim() || dateEl.getAttribute('datetime');
              if (event.datetime) break;
            }
          }

          // Look for host/organization
          const hostSelectors = ['[class*="host"]', '[class*="Host"]', '[class*="organization"]', '[class*="club"]'];
          for (const selector of hostSelectors) {
            const hostEl = element.querySelector(selector);
            if (hostEl && hostEl.textContent.trim()) {
              event.host_organization = hostEl.textContent.trim();
              break;
            }
          }

          // Look for attendees/RSVP
          const attendeeSelectors = ['[class*="attendee"]', '[class*="rsvp"]', '[class*="going"]'];
          for (const selector of attendeeSelectors) {
            const attendeeEls = element.querySelectorAll(selector);
            attendeeEls.forEach(el => {
              const name = el.textContent.trim();
              if (name && name.length > 0 && name.length < 100) {
                event.rsvp_list.push(name);
              }
            });
            if (event.rsvp_list.length > 0) break;
          }

          // Look for tags
          const tagSelectors = ['[class*="tag"]', '[class*="Tag"]', '[class*="category"]', '[class*="Category"]'];
          for (const selector of tagSelectors) {
            const tagEls = element.querySelectorAll(selector);
            tagEls.forEach(el => {
              const tag = el.textContent.trim();
              if (tag && tag.length > 0 && tag.length < 50) {
                event.tags.push(tag);
              }
            });
            if (event.tags.length > 0) break;
          }

          // Look for images
          const imgEl = element.querySelector('img');
          if (imgEl) {
            event.cover_image = imgEl.src || imgEl.getAttribute('data-src');
          }

          // Look for description
          const descSelectors = ['[class*="description"]', '[class*="Description"]', 'p'];
          for (const selector of descSelectors) {
            const descEl = element.querySelector(selector);
            if (descEl && descEl.textContent.trim().length > 20) {
              event.description = descEl.textContent.trim();
              break;
            }
          }

          // Only add if we found at least a name
          if (event.name) {
            results.push(event);
          }
        } catch (err) {
          console.error('Error parsing event:', err);
        }
      });

      return results;
    });

    console.log(`Found ${events.length} events`);

    // Save to JSON file
    await fs.writeFile(
      'events.json',
      JSON.stringify(events, null, 2),
      'utf-8'
    );

    console.log('Events saved to events.json');
    return events;

  } catch (error) {
    console.error('Error scraping events:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeEvents().catch(console.error);
