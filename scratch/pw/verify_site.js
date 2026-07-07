const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
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
    networkErrors.push(`Failed Request: ${request.url()} - ${request.failure()?.errorText || 'Unknown error'}`);
  });

  console.log('Navigating to http://31.220.94.217/product/d5608133-901d-4740-b08e-0e3beeca3bab...');
  await page.goto('http://31.220.94.217/product/d5608133-901d-4740-b08e-0e3beeca3bab', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const title = await page.title();
  console.log(`Page Title: ${title}`);
  
  const h1 = await page.evaluate(() => {
    const el = document.querySelector('h1');
    return el ? el.innerText : 'No H1 found';
  });
  console.log(`H1 Text: ${h1}`);
  
  const pointuresCount = await page.evaluate(() => {
    // Buttons matching sizes 36-41 in pointures grid
    return Array.from(document.querySelectorAll('button')).filter(b => /^(36|37|38|39|40|41)/.test(b.innerText)).length;
  });
  console.log(`Pointures Buttons Found: ${pointuresCount}`);

  const colorsCount = await page.evaluate(() => {
    // Buttons with color round pastille inside selection grid
    return document.querySelectorAll('button span[style*="background-color"]').length;
  });
  console.log(`Color Swatches Found: ${colorsCount}`);
  
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
