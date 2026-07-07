import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

const app = express();

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ 
  connectionString,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

function sendMailSimulated(to: string, subject: string, body: string) {
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logPath = path.join(logDir, 'emails.log');
  const logEntry = `[${new Date().toISOString()}] TO: ${to} | SUBJECT: ${subject}\nBODY:\n${body}\n========================================\n`;
  fs.appendFileSync(logPath, logEntry);
  console.log(`[EMAIL SIMULATION] Sent email to ${to} with subject "${subject}". Logged to ${logPath}`);
}

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Géré par Nginx
  crossOriginEmbedderPolicy: false
}));

// HTTP logs
app.use(morgan('combined'));

// CORS
app.use(cors({ origin: ['https://soley.ma', 'http://31.220.94.217', 'http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Trop de requêtes. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', globalLimiter);

// Rate limiting strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' }
});
app.use('/api/login', authLimiter);
app.use('/api/auth/login', authLimiter);
// Serve static files for uploads
app.use('/assets/products', express.static(path.join(__dirname, '../public/assets/products')));

// Setup uploads directory
const uploadDir = process.platform === 'win32'
  ? path.join(__dirname, '../public/assets/products')
  : '/var/www/soley/public/assets/products';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ 
  storage, 
  limits: { fileSize: 20 * 1024 * 1024 } 
});

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
    
    // Send simulated email
    sendMailSimulated(user.email, 'Bienvenue chez Soley.ma', `Bonjour ${user.name},\n\nVotre compte client a été créé avec succès sur Soley.ma !\n\nL'équipe Soley.`);

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

// Forgot / Reset Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate a temporary 6-digit PIN code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    // In production, we'd store it in DB with expiry. For simulation, print code in email log.
    sendMailSimulated(email, 'Réinitialisation de votre mot de passe - Soley.ma', `Bonjour,\n\nVous avez demandé à réinitialiser votre mot de passe.\nVoici votre code temporaire : ${resetCode}\n\nL'équipe Soley.`);
    res.json({ success: true, message: 'Reset code sent to email' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    sendMailSimulated(email, 'Mot de passe réinitialisé avec succès - Soley.ma', `Bonjour,\n\nVotre mot de passe a bien été modifié.\n\nL'équipe Soley.`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

const verifyAdmin = (req: any, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    req.user = decoded;
    next();
  });
};

async function logActivity(adminId: string, action: string, details: string) {
  try {
    await prisma.activityLog.create({
      data: {
        adminId,
        action,
        details
      }
    });
  } catch (error) {
    console.error('Failed to save activity log:', error);
  }
}

const verifyCustomer = (req: any, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded; // pass decoded user data
    next();
  });
};

app.get('/api/auth/me', verifyCustomer, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Customer not found' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

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

app.post('/api/products', verifyAdmin, async (req: any, res) => {
  try {
    const { colorIds, sizeIds, ...data } = req.body;
    
    // Auto-generate variants
    if (colorIds?.length || sizeIds?.length) {
      const cList = colorIds?.length ? colorIds : [null];
      const sList = sizeIds?.length ? sizeIds : [null];
      const totalVariants = cList.length * sList.length;
      const distributedStock = Math.max(0, Math.floor(Number(data.stock || 0) / totalVariants));
      const variants = [];
      for (const c of cList) {
        for (const s of sList) {
          const variantData: any = {
            stock: distributedStock,
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
    await logActivity(req.user.id, 'CREATE_PRODUCT', `Created product ${product.name} (Ref: ${product.reference})`);
    res.json(product);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'La référence ou le slug existe déjà.' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', verifyAdmin, async (req: any, res) => {
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

    if (colorIds !== undefined || sizeIds !== undefined) {
      await prisma.productVariant.deleteMany({ where: { productId: req.params.id } });
      if (colorIds?.length || sizeIds?.length) {
        const cList = colorIds?.length ? colorIds : [null];
        const sList = sizeIds?.length ? sizeIds : [null];
        const totalVariants = cList.length * sList.length;
        const targetStock = restData.stock !== undefined ? restData.stock : product.stock;
        const distributedStock = Math.max(0, Math.floor(Number(targetStock || 0) / totalVariants));
        const variants = [];
        for (const c of cList) {
          for (const s of sList) {
            const variantData: any = {
              stock: distributedStock,
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

    await logActivity(req.user.id, 'UPDATE_PRODUCT', `Updated product ${product.name} (Ref: ${product.reference})`);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', verifyAdmin, async (req: any, res) => {
  try {
    const productId = req.params.id;
    const linkedOrderCount = await prisma.orderItem.count({
      where: {
        productVariant: {
          productId: productId
        }
      }
    });

    if (linkedOrderCount > 0) {
      return res.status(400).json({ error: "Ce produit ne peut pas être supprimé car il est associé à des commandes existantes. Vous pouvez modifier son statut en 'draft' (brouillon) pour le masquer." });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    await prisma.product.delete({ where: { id: productId } });
    if (product) {
      await logActivity(req.user.id, 'DELETE_PRODUCT', `Deleted product ${product.name} (Ref: ${product.reference})`);
    }
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

    // Look up email for notification
    let customerEmail = req.body.email || '';
    if (!customerEmail && customerId) {
      const u = await prisma.user.findUnique({ where: { id: customerId } });
      if (u) customerEmail = u.email;
    }

    if (customerEmail) {
      sendMailSimulated(
        customerEmail,
        'Confirmation de votre commande - Soley.ma',
        `Bonjour ${customerName || 'Cher Client'},\n\nNous vous remercions pour votre commande.\nVotre commande #${order.id.substring(0, 8)} d'un montant de ${total} MAD a bien été reçue et est en cours de traitement.\n\nL'équipe Soley.`
      );
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});
app.put('/api/orders/:id', async (req, res) => {
  try {
    const oldOrder = await prisma.order.findUnique({ where: { id: req.params.id } });
    const order = await prisma.order.update({ 
      where: { id: req.params.id }, 
      data: req.body,
      include: { customer: true }
    });

    if (req.body.status && oldOrder && oldOrder.status !== req.body.status) {
      let customerEmail = order.customer?.email;
      let customerName = order.customerName || order.customer?.name || 'Client';
      
      if (customerEmail) {
        let subject = '';
        let body = '';
        if (req.body.status === 'processing') {
          subject = `Votre commande #${order.id.substring(0, 8)} est en cours de traitement - Soley.ma`;
          body = `Bonjour ${customerName},\n\nNous vous informons que votre commande #${order.id.substring(0, 8)} est en cours de préparation.\n\nL'équipe Soley.`;
        } else if (req.body.status === 'shipped') {
          subject = `Votre commande #${order.id.substring(0, 8)} a été expédiée - Soley.ma`;
          body = `Bonjour ${customerName},\n\nBonne nouvelle ! Votre commande #${order.id.substring(0, 8)} a été expédiée.\nTransporteur : ${order.carrier || 'Standard'}\nNuméro de suivi : ${order.trackingCode || 'N/A'}\n\nL'équipe Soley.`;
        } else if (req.body.status === 'delivered') {
          subject = `Votre commande #${order.id.substring(0, 8)} a été livrée - Soley.ma`;
          body = `Bonjour ${customerName},\n\nVotre commande #${order.id.substring(0, 8)} est marquée comme livrée.\nMerci de votre confiance !\n\nL'équipe Soley.`;
        } else if (req.body.status === 'cancelled') {
          subject = `Annulation de votre commande #${order.id.substring(0, 8)} - Soley.ma`;
          body = `Bonjour ${customerName},\n\nNous vous informons que votre commande #${order.id.substring(0, 8)} a été annulée.\n\nL'équipe Soley.`;
        }

        if (subject && body) {
          sendMailSimulated(customerEmail, subject, body);
        }
      }
    }

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


// --- WISHLIST ROUTES ---
app.get('/api/wishlist', verifyCustomer, async (req: any, res) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { customerId: req.user.id },
      include: {
        product: {
          include: {
            images: { orderBy: { position: 'asc' } },
            category: true,
            variants: {
              include: {
                size: true,
                color: true
              }
            }
          }
        }
      }
    });
    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

app.post('/api/wishlist', verifyCustomer, async (req: any, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID is required' });

    const item = await prisma.wishlist.upsert({
      where: {
        customerId_productId: {
          customerId: req.user.id,
          productId
        }
      },
      update: {},
      create: {
        customerId: req.user.id,
        productId
      }
    });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

app.delete('/api/wishlist/:productId', verifyCustomer, async (req: any, res) => {
  try {
    const { productId } = req.params;
    await prisma.wishlist.delete({
      where: {
        customerId_productId: {
          customerId: req.user.id,
          productId
        }
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// --- CUSTOMER ROUTES ---
app.get('/api/customers', verifyAdmin, async (req: any, res) => {
  try {
    const customers = await prisma.user.findMany({ where: { role: 'customer' } });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});
app.put('/api/customers/:id', verifyAdmin, async (req: any, res) => {
  try {
    const customer = await prisma.user.update({ where: { id: req.params.id }, data: req.body });
    await logActivity(req.user.id, 'UPDATE_CUSTOMER', `Updated customer ${customer.name} (Email: ${customer.email})`);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});
app.delete('/api/customers/:id', verifyAdmin, async (req: any, res) => {
  try {
    const customer = await prisma.user.findUnique({ where: { id: req.params.id } });
    await prisma.user.delete({ where: { id: req.params.id } });
    if (customer) {
      await logActivity(req.user.id, 'DELETE_CUSTOMER', `Deleted customer ${customer.name} (Email: ${customer.email})`);
    }
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
app.post('/api/settings', verifyAdmin, async (req: any, res) => {
  try {
    const { key, value } = req.body;
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    await logActivity(req.user.id, 'UPDATE_SETTINGS', `Updated setting key: ${key}`);
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save setting' });
  }
});

// --- NEW E-COMMERCE ENDPOINTS ---

// 1. GET Order details by ID (including items and images)
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { position: 'asc' } }
                  }
                },
                color: true,
                size: true
              }
            }
          }
        }
      }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// 2. Reviews Endpoints
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.id },
      include: {
        customer: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/products/:id/reviews', verifyCustomer, async (req: any, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment: comment || '',
        productId: req.params.id,
        customerId: req.user.id
      }
    });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// 3. Admin Audit Logs
app.get('/api/admin/logs', verifyAdmin, async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// 4. Admin CSV Products Export
app.get('/api/admin/products/export', verifyAdmin, async (req: any, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });

    let csvContent = "Reference,Name,Price,SalePrice,CostPrice,Stock,Category,Description\n";
    products.forEach(p => {
      const name = `"${(p.name || '').replace(/"/g, '""')}"`;
      const desc = `"${(p.description || '').replace(/"/g, '""')}"`;
      csvContent += `${p.reference || ''},${name},${p.price},${p.salePrice || ''},${p.costPrice || 0},${p.stock},"${p.category?.name || ''}",${desc}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products_export.csv');
    res.status(200).send(csvContent);
    
    await logActivity(req.user.id, 'EXPORT_PRODUCTS', `Exported ${products.length} products to CSV`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export products' });
  }
});

// 5. Admin CSV Products Import
app.post('/api/admin/products/import', verifyAdmin, async (req: any, res) => {
  try {
    const { csvText } = req.body;
    if (!csvText) return res.status(400).json({ error: 'Missing csvText' });

    const lines = csvText.split('\n');
    let count = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const matches = line.split(',');
      if (matches.length < 3) continue;

      const reference = matches[0]?.replace(/^"|"$/g, '').trim();
      const name = matches[1]?.replace(/^"|"$/g, '').trim();
      const price = parseFloat(matches[2] || '0');
      const salePriceVal = matches[3]?.replace(/^"|"$/g, '').trim();
      const salePrice = salePriceVal ? parseFloat(salePriceVal) : null;
      const costPrice = parseFloat(matches[4] || '0');
      const stock = parseInt(matches[5] || '0');
      const categoryName = matches[6]?.replace(/^"|"$/g, '').trim();
      const description = matches[7]?.replace(/^"|"$/g, '').trim() || '';

      if (!name || !reference) continue;

      let categoryId = '';
      if (categoryName) {
        const cat = await prisma.category.upsert({
          where: { slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
          update: {},
          create: {
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          }
        });
        categoryId = cat.id;
      } else {
        const firstCat = await prisma.category.findFirst();
        if (firstCat) categoryId = firstCat.id;
        else {
          const defaultCat = await prisma.category.create({
            data: { name: 'Default', slug: 'default' }
          });
          categoryId = defaultCat.id;
        }
      }

      await prisma.product.upsert({
        where: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        update: {
          reference,
          price,
          salePrice,
          costPrice,
          stock,
          categoryId,
          description
        },
        create: {
          reference,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          price,
          salePrice,
          costPrice,
          stock,
          categoryId,
          description
        }
      });
      count++;
    }

    await logActivity(req.user.id, 'IMPORT_PRODUCTS', `Imported/Updated ${count} products from CSV`);
    res.json({ success: true, count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to import CSV' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
