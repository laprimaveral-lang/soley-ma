import axios from 'axios';

async function update() {
  await axios.put('http://localhost:3001/api/categories/b0aa6930-39e7-4b93-a59d-aa46f8cc569b', {
    name: 'Sandales',
    slug: 'sandales',
    description: 'Medicale',
    active: true
  });
  console.log('Category updated');
}

update().catch(console.error);
