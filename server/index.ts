import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';

const app = express();

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ 
  connectionString,
  ssl: true
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());
// Serve static files for uploads
app.use('/assets/products', express.static(path.join(__dirname, '../public/assets/products')));

// Setup uploads directory
const uploadDir = path.join(__dirname, '../public/assets/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

// --- AUTH ROUTES ---
// Admin Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Customer Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'customer' }
    });
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

const verifyAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    next();
  });
};

const verifyCustomer = (req: any, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded; // pass decoded user data
    next();
  });
};

// --- GLOBAL UPLOAD ---
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const urls = files.map(file => `/assets/products/${file.filename}`);
    res.json({ urls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});


// --- PRODUCT ROUTES ---
app.get('/api/products', async (req, res) => {
  try {
    const { category, collection, color, size, search, isNew, isBestSeller, status } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (isNew === 'true') where.isNew = true;
    if (isBestSeller === 'true') where.isBestSeller = true;
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { reference: { contains: String(search), mode: 'insensitive' } }
      ];
    }
    if (category) {
      where.category = { slug: { equals: String(category), mode: 'insensitive' } };
    }
    if (collection) {
      where.collections = { some: { slug: String(collection) } };
    }
    if (color || size) {
      where.variants = { some: {} };
      if (color) where.variants.some.color = { name: String(color) };
      if (size) where.variants.some.size = { value: String(size) };
    }

    const products = await prisma.product.findMany({ 
      where,
      include: { 
        images: { orderBy: { position: 'asc' } }, 
        category: true, 
        collections: true,
        variants: {
          include: {
            size: true,
            color: true
          }
        }
      } 
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { colorIds, sizeIds, ...data } = req.body;
    
    // Auto-generate variants
    if (colorIds?.length || sizeIds?.length) {
      const cList = colorIds?.length ? colorIds : [null];
      const sList = sizeIds?.length ? sizeIds : [null];
      const variants = [];
      for (const c of cList) {
        for (const s of sList) {
          const variantData: any = {
            stock: 0,
            sku: `${data.reference}-${c || 'NA'}-${s || 'NA'}-${Math.random().toString(36).substring(7)}`
          };
          if (c) variantData.colorId = c;
          if (s) variantData.sizeId = s;
          variants.push(variantData);
        }
      }
      data.variants = { create: variants };
    }

    // Ensure unique slug
    let uniqueSlug = data.slug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${data.slug}-${counter}`;
      counter++;
    }
    data.slug = uniqueSlug;

    const product = await prisma.product.create({ data });
    res.json(product);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'La référence ou le slug existe déjà.' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { images, colorIds, sizeIds, ...restData } = req.body;
    
    // First update scalar fields
    const product = await prisma.product.update({ 
      where: { id: req.params.id }, 
      data: restData 
    });

    // Handle images if provided
    if (images && images.create) {
      await prisma.productImage.deleteMany({ where: { productId: req.params.id } });
      for (const img of images.create) {
        await prisma.productImage.create({
          data: {
            productId: req.params.id,
            image: img.image,
            position: img.position
          }
        });
      }
    }

    // Handle variants if provided
    if (colorIds !== undefined || sizeIds !== undefined) {
      await prisma.productVariant.deleteMany({ where: { productId: req.params.id } });
      if (colorIds?.length || sizeIds?.length) {
        const cList = colorIds?.length ? colorIds : [null];
        const sList = sizeIds?.length ? sizeIds : [null];
        const variants = [];
        for (const c of cList) {
          for (const s of sList) {
            const variantData: any = {
              stock: 0,
              sku: `${restData.reference || product.reference}-${c || 'NA'}-${s || 'NA'}-${Math.random().toString(36).substring(7)}`
            };
            if (c) variantData.colorId = c;
            if (s) variantData.sizeId = s;
            variants.push(variantData);
          }
        }
        await prisma.product.update({
          where: { id: req.params.id },
          data: {
            variants: {
              create: variants
            }
          }
        });
      }
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});


// --- CATEGORY ROUTES ---
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});
app.post('/api/categories', verifyAdmin, async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'Le nom et le slug sont requis.' });
    
    const category = await prisma.category.create({ data: { name, slug, description } });
    res.json(category);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Une catégorie avec ce slug existe déjà.' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});
app.put('/api/categories/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'Le nom et le slug sont requis.' });

    const category = await prisma.category.update({ 
      where: { id: String(req.params.id) }, 
      data: { name, slug, description } 
    });
    res.json(category);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Une catégorie avec ce slug existe déjà.' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});
app.delete('/api/categories/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});


// --- COLLECTION ROUTES ---
app.get('/api/collections', async (req, res) => {
  try {
    const collections = await prisma.collection.findMany();
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});
app.post('/api/collections', async (req, res) => {
  try {
    const collection = await prisma.collection.create({ data: req.body });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create collection' });
  }
});
app.put('/api/collections/:id', async (req, res) => {
  try {
    const collection = await prisma.collection.update({ where: { id: req.params.id }, data: req.body });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update collection' });
  }
});
app.delete('/api/collections/:id', async (req, res) => {
  try {
    await prisma.collection.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});


// --- COLOR ROUTES ---
app.get('/api/colors', async (req, res) => {
  try {
    const colors = await prisma.color.findMany();
    res.json(colors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch colors' });
  }
});
app.post('/api/colors', async (req, res) => {
  try {
    const color = await prisma.color.create({ data: req.body });
    res.json(color);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create color' });
  }
});
app.put('/api/colors/:id', async (req, res) => {
  try {
    const color = await prisma.color.update({ where: { id: req.params.id }, data: req.body });
    res.json(color);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update color' });
  }
});
app.delete('/api/colors/:id', async (req, res) => {
  try {
    await prisma.color.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete color' });
  }
});


// --- SIZE ROUTES ---
app.get('/api/sizes', async (req, res) => {
  try {
    const sizes = await prisma.size.findMany();
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sizes' });
  }
});
app.post('/api/sizes', async (req, res) => {
  try {
    const size = await prisma.size.create({ data: req.body });
    res.json(size);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create size' });
  }
});
app.put('/api/sizes/:id', async (req, res) => {
  try {
    const size = await prisma.size.update({ where: { id: req.params.id }, data: req.body });
    res.json(size);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update size' });
  }
});
app.delete('/api/sizes/:id', async (req, res) => {
  try {
    await prisma.size.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete size' });
  }
});


// --- BANNER ROUTES ---
app.get('/api/banners', async (req, res) => {
  try {
    const banners = await prisma.banner.findMany();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});
app.post('/api/banners', async (req, res) => {
  try {
    const banner = await prisma.banner.create({ data: req.body });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create banner' });
  }
});
app.put('/api/banners/:id', async (req, res) => {
  try {
    const banner = await prisma.banner.update({ where: { id: req.params.id }, data: req.body });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
});
app.delete('/api/banners/:id', async (req, res) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});


// --- COUPON ROUTES ---
app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});
app.post('/api/coupons', async (req, res) => {
  try {
    const coupon = await prisma.coupon.create({ data: req.body });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});
app.put('/api/coupons/:id', async (req, res) => {
  try {
    const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: req.body });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});
app.delete('/api/coupons/:id', async (req, res) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});


// --- ORDER ROUTES ---
app.get('/api/orders/me', verifyCustomer, async (req: any, res) => {
  try {
    const orders = await prisma.order.findMany({ 
      where: { customerId: req.user.id },
      include: { items: { include: { productVariant: { include: { product: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch personal orders' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ include: { customer: true, items: true } });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});
app.post('/api/orders', async (req, res) => {
  try {
    const { items, customerId, customerName, customerPhone, shippingAddress, subtotal, total, shipping, discount } = req.body;
    
    const order = await prisma.order.create({
      data: {
        customerId,
        customerName,
        customerPhone,
        shippingAddress,
        subtotal: subtotal || total,
        total,
        shipping: shipping || 0,
        discount: discount || 0,
        status: 'pending',
        items: {
          create: items.map((item: any) => ({
            productVariantId: item.productVariantId || item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});
app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.update({ where: { id: req.params.id }, data: req.body });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});
app.delete('/api/orders/:id', async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});


// --- CUSTOMER ROUTES ---
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await prisma.user.findMany({ where: { role: 'customer' } });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});
app.put('/api/customers/:id', async (req, res) => {
  try {
    const customer = await prisma.user.update({ where: { id: req.params.id }, data: req.body });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});
app.delete('/api/customers/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});


// --- SETTING ROUTES ---
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});
app.post('/api/settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save setting' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
