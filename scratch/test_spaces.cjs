const axios = require('axios');

async function checkUrl(url) {
  try {
    const res = await axios.head(url);
    console.log(`✔ OK [${res.status}]: ${url}`);
  } catch (e) {
    console.log(`✖ FAIL [${e.response ? e.response.status : 'ERR'}]: ${url}`);
  }
}

async function run() {
  await checkUrl('http://31.220.94.217/assets/products/1783439196443-test-image-200-kb.jpg');
  await checkUrl('http://31.220.94.217/assets/products/1783439225497-Daim%20noir.png');
}

run();
