const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const errors = [];
  const networkErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });

  page.on('requestfailed', request => {
    networkErrors.push(`Failed Request: ${request.url()} - ${request.failure().errorText}`);
  });

  console.log('Navigating to http://31.220.94.217...');
  const response = await page.goto('http://31.220.94.217', { waitUntil: 'networkidle0', timeout: 30000 });
  
  console.log(`Status Code: ${response.status()}`);
  
  // Wait for React to render
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Taking screenshot...');
  const screenshotPath = 'C:\\Users\\ok\\.gemini\\antigravity\\brain\\fef78fda-36eb-4318-b9ab-078cd1f5ba42\\soley_screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved to ${screenshotPath}`);
  
  const title = await page.title();
  console.log(`Page Title: ${title}`);
  
  const h1 = await page.evaluate(() => {
    const el = document.querySelector('h1');
    return el ? el.innerText : 'No H1 found';
  });
  console.log(`H1 Text: ${h1}`);
  
  const welcomeText = await page.evaluate(() => {
    return document.body.innerText.includes('Welcome to nginx!');
  });
  console.log(`Contains 'Welcome to nginx!': ${welcomeText}`);
  
  console.log('--- Errors ---');
  if (errors.length > 0) {
    errors.forEach(e => console.log(e));
  } else {
    console.log('No JavaScript errors detected.');
  }
  
  console.log('--- Network Errors ---');
  if (networkErrors.length > 0) {
    networkErrors.forEach(e => console.log(e));
  } else {
    console.log('No Network errors detected.');
  }

  await browser.close();
})();
