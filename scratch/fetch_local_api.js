async function test() {
  try {
    const catsRes = await fetch('http://localhost:3001/api/categories');
    const cats = await catsRes.json();
    console.log('=== CATEGORIES ===');
    console.log(JSON.stringify(cats, null, 2));

    const prodsRes = await fetch('http://localhost:3001/api/products');
    const prods = await prodsRes.json();
    console.log('=== PRODUCTS ===');
    console.log(JSON.stringify(prods.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryId: p.categoryId,
      categoryName: p.category?.name,
      categorySlug: p.category?.slug,
      active: p.active,
      stock: p.stock,
      imagesCount: p.images?.length,
      variantsCount: p.variants?.length,
    })), null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
