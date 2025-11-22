import fs from 'fs/promises';

/**
 * Alternative scraper that attempts to find and use Princeton's internal API
 * This is faster than browser automation if the API is accessible
 */

async function tryApiScrape() {
  console.log('Attempting to find Princeton Events API...');
  
  // Common API endpoint patterns to try
  const possibleEndpoints = [
    'https://my.princeton.edu/api/events',
    'https://my.princeton.edu/api/v1/events',
    'https://my.princeton.edu/api/v2/events',
    'https://api.princeton.edu/events',
    'https://my.princeton.edu/events/api',
  ];

  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`Trying: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Found API endpoint!');
        console.log('Response structure:', JSON.stringify(data, null, 2).slice(0, 500));
        
        // Save raw response for inspection
        await fs.writeFile(
          'api-response.json',
          JSON.stringify(data, null, 2),
          'utf-8'
        );
        
        return { success: true, endpoint, data };
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - ${error.message}`);
    }
  }

  console.log('\n⚠️  Could not find accessible API endpoint');
  console.log('You will need to use the browser automation scraper (scraper.js)');
  return { success: false };
}

// Instructions for manual API discovery
async function printApiDiscoveryInstructions() {
  console.log('\n📖 Manual API Discovery Instructions:');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('1. Open https://my.princeton.edu/events in your browser');
  console.log('2. Open Developer Tools (F12)');
  console.log('3. Go to the Network tab');
  console.log('4. Filter for "Fetch/XHR"');
  console.log('5. Refresh the page and look for API calls');
  console.log('6. Look for JSON responses containing event data');
  console.log('7. Right-click the request and "Copy as cURL"');
  console.log('8. Use that URL and headers in this script\n');
  console.log('Common patterns to look for:');
  console.log('  - URLs containing "api", "events", "graphql"');
  console.log('  - Request headers with authentication tokens');
  console.log('  - POST requests with query parameters\n');
}

// Sample function to use discovered API
async function scrapeWithDiscoveredApi(apiUrl, headers = {}) {
  console.log('Fetching from discovered API...');
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        ...headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Transform API data to our schema
    const events = transformApiData(data);
    
    await fs.writeFile(
      'events.json',
      JSON.stringify(events, null, 2),
      'utf-8'
    );
    
    console.log(`✅ Saved ${events.length} events to events.json`);
    return events;
    
  } catch (error) {
    console.error('Error fetching from API:', error);
    throw error;
  }
}

// Transform function - customize based on actual API response structure
function transformApiData(apiResponse) {
  // Example transformation - adjust based on actual API structure
  const events = [];
  
  // Handle different possible API structures
  const eventArray = apiResponse.events || apiResponse.data || apiResponse.results || apiResponse;
  
  if (!Array.isArray(eventArray)) {
    console.warn('API response is not an array, attempting to extract events...');
    return [];
  }
  
  for (const item of eventArray) {
    const event = {
      id: item.id || item._id || `event_${Date.now()}_${Math.random()}`,
      name: item.name || item.title || item.eventName || null,
      location: item.location || item.venue || item.place || null,
      datetime: item.datetime || item.date || item.startTime || null,
      host_organization: item.host || item.organization || item.club || item.organizer || null,
      rsvp_list: item.attendees || item.rsvps || item.going || [],
      tags: item.tags || item.categories || item.labels || [],
      cover_image: item.image || item.coverImage || item.thumbnail || null,
      description: item.description || item.details || item.about || null
    };
    
    events.push(event);
  }
  
  return events;
}

// Main execution
async function main() {
  console.log('Princeton Events API Scraper (Alternative Method)\n');
  
  const result = await tryApiScrape();
  
  if (!result.success) {
    await printApiDiscoveryInstructions();
    console.log('\n💡 TIP: If you discover the API endpoint, use it like this:');
    console.log('');
    console.log('const events = await scrapeWithDiscoveredApi(');
    console.log('  "https://my.princeton.edu/api/events",');
    console.log('  { "Authorization": "Bearer YOUR_TOKEN" }');
    console.log(');\n');
  }
}

main().catch(console.error);

// Export for use in other scripts
export { scrapeWithDiscoveredApi, transformApiData };
