const axios = require('axios');

async function testUpload(sizeInBytes, label) {
  console.log(`\nTesting upload for: ${label} (${(sizeInBytes / 1024 / 1024).toFixed(2)} MB)...`);
  
  // Create a dummy buffer of the specified size
  const buffer = Buffer.alloc(sizeInBytes, 'a');
  
  const FormData = require('form-data');
  const form = new FormData();
  form.append('images', buffer, {
    filename: `test-${label.toLowerCase().replace(/ /g, '-')}.jpg`,
    contentType: 'image/jpeg',
  });

  try {
    const response = await axios.post('http://31.220.94.217/api/upload', form, {
      headers: {
        ...form.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log(`✔ Success: ${label} uploaded!`);
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error(`✖ Failed to upload ${label}:`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

async function run() {
  try {
    const results = [
      await testUpload(200 * 1024, 'Image 200 KB'),
      await testUpload(2 * 1024 * 1024, 'Image 2 MB'),
      await testUpload(10 * 1024 * 1024, 'Image 10 MB')
    ];
    
    if (results.every(r => r === true)) {
      console.log('\n=== ALL UPLOADS COMPLETED SUCCESSFULLY! ===');
    } else {
      console.log('\n=== SOME UPLOADS FAILED! ===');
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
