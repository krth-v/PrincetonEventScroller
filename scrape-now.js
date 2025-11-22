#!/usr/bin/env node

/**
 * Automated Princeton Events Scraper - Simple Version
 * Logs in with CAS, extracts events, saves JSON
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import readline from 'readline';

const PRINCETON_EVENTS_URL = 'https://my.princeton.edu/events';

// Function to prompt user for input
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Function to prompt for password (hidden input)
function promptPassword(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    // Mute output for password
    rl.question(question, (answer) => {
      rl.close();
      console.log(''); // New line after password input
      resolve(answer);
    });
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (stringToWrite.charCodeAt(0) === 13) {
        rl.output.write('\n');
      } else {
        rl.output.write('*');
      }
    };
  });
}

async function main() {
  console.log('🎓 Princeton Events - Automated Scraper');
  console.log('═══════════════════════════════════════\n');

  // Try to get from environment variables first, otherwise prompt
  let netid = process.env.PRINCETON_NETID;
  let password = process.env.PRINCETON_PASSWORD;

  if (!netid) {
    netid = await prompt('Princeton NetID: ');
  }

  if (!password) {
    password = await promptPassword('Password: ');
  }

  if (!netid || !password) {
    console.error('❌ Error: Credentials cannot be empty\n');
    process.exit(1);
  }

  console.log(`📝 NetID: ${netid}`);
  console.log(`📝 Password: ${'*'.repeat(password.length)}\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  try {
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📍 Step 1: Navigating to events page...');
    await page.goto(PRINCETON_EVENTS_URL, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    const currentUrl = page.url();
    console.log(`   URL: ${currentUrl}`);
    
    if (currentUrl.includes('cas/login') || currentUrl.includes('fed.princeton.edu')) {
      console.log('\n🔐 Step 2: Logging in with CAS...');

      await page.waitForSelector('input[name="username"], input[id="username"]', { timeout: 10000 });
      console.log('   ✓ Login form found');

      console.log('   ↳ Entering credentials...');
      await page.type('input[name="username"], input[id="username"]', netid);
      await page.type('input[name="password"], input[id="password"]', password);

      console.log('   ↳ Submitting...');
      await Promise.all([
        page.click('button[type="submit"], input[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
      ]);

      // Check if we're still on login page (authentication failed)
      const afterLoginUrl = page.url();
      if (afterLoginUrl.includes('cas/login') || afterLoginUrl.includes('fed.princeton.edu')) {
        console.error('\n❌ Authentication failed: Invalid credentials');
        console.error('   Please check your NetID and password\n');
        await browser.close();
        process.exit(1);
      }

      console.log('   ✓ Login successful!\n');
    }
    
    console.log('⏳ Step 3: Loading events...');
    
    await page.waitForSelector('li.list-group-item[id^="event_"]', { 
      timeout: 15000 
    }).catch(() => {
      console.log('   ⚠ Using wait fallback...');
    });
    
    console.log('   ✓ Events loaded\n');
    
    console.log('📜 Step 4: Scrolling to load all events...');
    await autoScroll(page);
    console.log('   ✓ Scroll complete\n');
    
    console.log('📊 Step 5: Extracting event data...');
    const events = await page.evaluate(() => {
      const extractedEvents = [];
      const eventItems = document.querySelectorAll('li.list-group-item[id^="event_"]');
      
      console.log(`Found ${eventItems.length} event items`);
      
      eventItems.forEach((item, index) => {
        try {
          const evt = {
            id: item.id || `pu_event_${Date.now()}_${index}`,
            name: null,
            location: null,
            datetime: null,
            host_organization: null,
            tags: [],
            cover_image: null,
            rsvp_count: 0,
            source: 'my.princeton.edu'
          };
          
          const nameEl = item.querySelector('h3.media-heading a');
          if (nameEl) evt.name = nameEl.textContent.trim();
          
          const dateEls = item.querySelectorAll('.media-heading p');
          if (dateEls.length > 0) {
            evt.datetime = Array.from(dateEls).map(el => el.textContent.trim()).join(' ');
          }
          
          const locationMarker = item.querySelector('.mdi-map-marker');
          if (locationMarker && locationMarker.parentElement) {
            evt.location = locationMarker.parentElement.textContent.replace(/\s+/g, ' ').trim();
          }
          
          const rsvpEl = item.querySelector('.event_display1');
          if (rsvpEl) {
            const match = rsvpEl.textContent.match(/(\d+)\s+going/);
            if (match) evt.rsvp_count = parseInt(match[1]);
          }
          
          const hostEl = item.querySelector('.listing-element__btn-block .h6.grey-element');
          if (hostEl) evt.host_organization = hostEl.textContent.trim();
          
          const tagLinks = item.querySelectorAll('.rsvp__event-tags a .label-tag');
          tagLinks.forEach(tag => {
            const tagText = tag.textContent.trim();
            if (tagText) evt.tags.push(tagText);
          });
          
          const imgEl = item.querySelector('.listing-element__preimg-block img');
          if (imgEl && imgEl.src && !imgEl.src.includes('listing-default.png')) {
            evt.cover_image = imgEl.src;
          }
          
          // Filter out placeholder events with bracket notation
          if (evt.name && !evt.name.includes('[') && !evt.name.includes(']')) {
            extractedEvents.push(evt);
          }
        } catch (err) {
          console.error('Parse error:', err);
        }
      });
      
      return extractedEvents;
    });
    
    console.log(`   ✓ Extracted ${events.length} events\n`);
    
    console.log('💾 Step 6: Saving data...');
    await fs.writeFile('events.json', JSON.stringify(events, null, 2));
    console.log('   ✓ Saved to events.json\n');
    
    const cookies = await page.cookies();
    await fs.writeFile('princeton-cookies.json', JSON.stringify(cookies, null, 2));
    console.log('   ✓ Saved cookies\n');
    
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║              SUCCESS! ✅                        ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    console.log(`📊 ${events.length} events saved to events.json\n`);
    
    if (events.length > 0) {
      console.log('📋 Sample events:\n');
      events.slice(0, 3).forEach((evt, i) => {
        console.log(`${i + 1}. ${evt.name}`);
        if (evt.datetime) console.log(`   📅 ${evt.datetime.substring(0, 60)}`);
        if (evt.location) console.log(`   📍 ${evt.location}`);
        if (evt.rsvp_count) console.log(`   ✓ ${evt.rsvp_count} attending`);
        console.log('');
      });
    }
    
    console.log('🚀 Next: npm run server\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    await browser.close();
    process.exit(1);
  } finally {
    await browser.close();
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
  await new Promise(resolve => setTimeout(resolve, 2000));
}

main().catch(console.error);
