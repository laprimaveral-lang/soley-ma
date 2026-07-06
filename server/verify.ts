import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function runTests() {
  let passed = 0;
  let failed = 0;

  console.log('--- Starting Production Verification Suite ---');

  const assert = async (name: string, promise: Promise<any>) => {
    try {
      const res = await promise;
      console.log(`[PASS] ${name}`);
      passed++;
      return res.data;
    } catch (e: any) {
      console.error(`[FAIL] ${name} - ${e.message} ${e.response?.data ? JSON.stringify(e.response.data) : ''}`);
      failed++;
      return null;
    }
  };

  // 1. Test public endpoints
  await assert('Get Products', axios.get(`${API_URL}/products`));
  await assert('Get Categories', axios.get(`${API_URL}/categories`));
  await assert('Get Collections', axios.get(`${API_URL}/collections`));
  await assert('Get Colors', axios.get(`${API_URL}/colors`));
  await assert('Get Sizes', axios.get(`${API_URL}/sizes`));

  // 2. Test Customer Registration
  const randomEmail = `test${Date.now()}@test.com`;
  const registerRes = await assert('Customer Registration', axios.post(`${API_URL}/auth/register`, {
    name: 'Automated Tester',
    email: randomEmail,
    password: 'password123',
    phone: '0600000000'
  }));

  if (registerRes && registerRes.token) {
    const token = registerRes.token;
    
    // 3. Test Customer Login
    await assert('Customer Login', axios.post(`${API_URL}/auth/login`, {
      email: randomEmail,
      password: 'password123'
    }));

    // 4. Test Protected Customer Endpoint (Profile)
    await assert('Get Customer Profile', axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }));

    // 5. Test Wishlist
    // We need a product first
    const productsRes = await axios.get(`${API_URL}/products`);
    if (productsRes.data && productsRes.data.length > 0) {
      const prodId = productsRes.data[0].id;
      
      await assert('Add to Wishlist', axios.post(`${API_URL}/wishlist`, { productId: prodId }, {
        headers: { Authorization: `Bearer ${token}` }
      }));
      
      await assert('Get Wishlist', axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      }));
    }

    // 6. Test Orders (Checkout)
    await assert('Create Order (Checkout)', axios.post(`${API_URL}/orders`, {
      items: [
        { variantId: "some-id-if-exists-or-mock", quantity: 1, price: 100 }
      ],
      total: 100,
      customerName: "Automated Tester",
      email: randomEmail,
      phone: "0600000000",
      address: "123 Test St",
      city: "Test City"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }));

  }

  // 7. Test Admin Login
  const adminRes = await assert('Admin Login', axios.post(`${API_URL}/login`, {
    email: 'laprimaveral@gmail.com',
    password: 'B@51275ua'
  }));

  if (adminRes && adminRes.token) {
    const adminToken = adminRes.token;
    // 8. Test Admin Protected Endpoint
    await assert('Admin Get Orders', axios.get(`${API_URL}/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }));
  }

  console.log('--- Verification Complete ---');
  console.log(`Passed: ${passed} | Failed: ${failed}`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
