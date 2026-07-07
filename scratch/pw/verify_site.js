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

  const categoriesList = ['sandales', 'mules', 'sabots', 'mocassins', 'slippers'];
  
  for (const cat of categoriesList) {
    console.log(`Navigating to http://31.220.94.217/collections/${cat}...`);
    await page.goto(`http://31.220.94.217/collections/${cat}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const h1 = await page.evaluate(() => {
      const el = document.querySelector('h1');
      return el ? el.innerText : 'No H1 found';
    });
    
    const cardCount = await page.evaluate(() => {
      return document.querySelectorAll('a[href^="/product/"]').length;
    });
    
    console.log(`Category: ${cat} | H1: ${h1} | Cards: ${cardCount}`);
  }
  
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
