import axios from 'axios';

async function update() {
  try {
    const sizeIds = [
      "ee1d3d16-5dbd-44ef-99c4-81bac874ab31", // 37
      "67f3bccc-c904-4edb-9dec-443ac4d57af4", // 38
      "755ba886-547e-4456-b9ad-f3365d423b68", // 39
      "2f8193dc-04c3-4920-be15-412775507db8", // 40
      "05b059c2-493d-4369-ba02-116bf3764a93"  // 41
    ];
    await axios.put('http://localhost:3001/api/products/c0005c73-3166-4767-94a3-1b7e268b2438', {
      sizeIds,
      colorIds: []
    });
    console.log('Product variants updated');
  } catch(e) {
    console.error(e.response?.data || e.message);
  }
}

update();
