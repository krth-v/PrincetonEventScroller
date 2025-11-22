/**
 * Simple Princeton Authentication - Fetch with Cookies
 * 
 * This is a simpler, more reliable method that:
 * 1. You authenticate in your browser
 * 2. Copy your session cookies
 * 3. Use them to fetch events programmatically
 */

import fs from 'fs/promises';

const MY_PRINCETON_EVENTS = 'https://my.princeton.edu/events';

/**
 * Instructions for manual authentication
 */
export function printCookieInstructions() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Princeton Events - Manual Cookie Authentication      ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log('This method is more reliable than browser automation!\n');
  
  console.log('📋 Step 1: Get Your Session Cookies');
  console.log('   1. Open https://my.princeton.edu/events in Chrome');
  console.log('   2. Log in with your Princeton NetID');
  console.log('   3. Press F12 to open DevTools');
  console.log('   4. Go to: Application tab → Cookies → my.princeton.edu');
  console.log('   5. Look for cookies (usually named like: session, auth, token)');
  console.log('   6. Copy the cookie Name and Value\n');
  
  console.log('📋 Step 2: Create cookies.json file');
  console.log('   Create a file called cookies.json with this format:\n');
  console.log('   {');
  console.log('     "cookie_name": "cookie_value",');
  console.log('     "another_cookie": "another_value"');
  console.log('   }\n');
  
  console.log('📋 Step 3: Run the fetcher');
  console.log('   node simple-auth-fetch.js\n');
  
  console.log('💡 Tip: Your session cookies usually last for hours or days,');
  console.log('   so you only need to do this once!\n');
}

/**
 * Fetch events using saved cookies
 */
export async function fetchEventsWithManualCookies() {
  console.log('🍪 Fetching events with saved cookies...\n');
  
  try {
    // Load cookies
    const cookiesJson = await fs.readFile('cookies.json', 'utf-8');
    const cookies = JSON.parse(cookiesJson);
    
    // Convert to cookie header string
    const cookieHeader = Object.entries(cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
    
    console.log('📡 Fetching from my.princeton.edu/events...');
    
    // Fetch the page
    const response = await fetch(MY_PRINCETON_EVENTS, {
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Check if we're authenticated (not redirected to login)
    if (html.includes('cas/login') || html.includes('Sign in')) {
      throw new Error('Not authenticated - cookies may be expired. Please update cookies.json');
    }
    
    console.log('✅ Successfully fetched page (authenticated)\n');
    
    // Save HTML for inspection
    await fs.writeFile('events-page.html', html);
    console.log('💾 Saved page HTML to events-page.html');
    console.log('   You can open this file to see the page structure\n');
    
    // Try to parse events from HTML
    console.log('🔍 Parsing events from HTML...');
    const events = parseEventsFromHtml(html);
    
    if (events.length > 0) {
      await fs.writeFile('events.json', JSON.stringify(events, null, 2));
      console.log(`✅ Found and saved ${events.length} events to events.json\n`);
      return events;
    } else {
      console.log('⚠️  No events found in HTML');
      console.log('   The page structure may have changed.');
      console.log('   Check events-page.html to see what we received.\n');
      return [];
    }
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ cookies.json file not found!\n');
      printCookieInstructions();
    } else {
      console.error('❌ Error:', error.message);
    }
    throw error;
  }
}

/**
 * Simple HTML parser for events
 * Note: This is basic - you may need to adjust based on actual HTML structure
 */
function parseEventsFromHtml(html) {
  const events = [];
  
  // This is a simple regex-based parser
  // In production, you'd use a proper HTML parser like cheerio or jsdom
  
  // Look for common patterns in event listings
  const eventPatterns = [
    // Pattern 1: Look for event titles in h2/h3 tags
    /<h[23][^>]*>(.*?)<\/h[23]>/gi,
    // Pattern 2: Look for event data in divs
    /<div[^>]*class="[^"]*event[^"]*"[^>]*>(.*?)<\/div>/gi,
  ];
  
  // Try each pattern
  for (const pattern of eventPatterns) {
    const matches = [...html.matchAll(pattern)];
    if (matches.length > 10) { // Likely found events
      console.log(`   Found ${matches.length} potential events with pattern`);
      break;
    }
  }
  
  // Note: Real parsing would require seeing the actual HTML structure
  console.log('   Basic HTML parsing complete');
  console.log('   For better results, inspect events-page.html and update parsing logic\n');
  
  return events;
}

/**
 * Interactive helper to create cookies.json
 */
export async function createCookiesFile() {
  const readline = (await import('readline')).default;
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
  
  console.log('\n🔧 Cookie File Creator\n');
  console.log('Enter your cookies from the browser.');
  console.log('Press Enter with empty input when done.\n');
  
  const cookies = {};
  let index = 1;
  
  while (true) {
    const name = await question(`Cookie ${index} name (or press Enter to finish): `);
    if (!name.trim()) break;
    
    const value = await question(`Cookie ${index} value: `);
    cookies[name.trim()] = value.trim();
    index++;
  }
  
  if (Object.keys(cookies).length === 0) {
    console.log('\n❌ No cookies entered. Please try again.\n');
    rl.close();
    return;
  }
  
  await fs.writeFile('cookies.json', JSON.stringify(cookies, null, 2));
  console.log('\n✅ Saved cookies to cookies.json');
  console.log('Now run: node simple-auth-fetch.js\n');
  
  rl.close();
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'setup') {
    // Interactive cookie setup
    createCookiesFile().catch(console.error);
  } else if (command === 'help') {
    // Show instructions
    printCookieInstructions();
  } else {
    // Try to fetch with existing cookies
    fetchEventsWithManualCookies()
      .then(events => {
        if (events.length > 0) {
          console.log('🎉 Success! Events saved to events.json');
          console.log('Run: npm run server');
        } else {
          console.log('\n💡 Next steps:');
          console.log('1. Open events-page.html to inspect the structure');
          console.log('2. Update the parsing logic in this file');
          console.log('3. Or extract events manually from the browser\n');
        }
      })
      .catch(() => {
        process.exit(1);
      });
  }
}
