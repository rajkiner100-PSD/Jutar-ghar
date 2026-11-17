import bcrypt from 'bcryptjs';
import { getDb } from './database';

export async function seed() {
  console.log('🌱 Starting database seed for Jutar Ghor...');
  const db = await getDb();

  // 1. Create Default Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const customerPasswordHash = await bcrypt.hash('customer123', 10);

  await db.run(
    `INSERT OR REPLACE INTO users (id, email, password_hash, full_name, phone, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      1,
      'admin@jutarghor.com',
      adminPasswordHash,
      'Jutar Ghor Admin',
      '01700000000',
      'admin',
    ]
  );

  await db.run(
    `INSERT OR REPLACE INTO users (id, email, password_hash, full_name, phone, role)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      2,
      'rahim@gmail.com',
      customerPasswordHash,
      'Rahim Ahmed',
      '01712345678',
      'customer',
    ]
  );
  console.log('✅ Users seeded (Admin: admin@jutarghor.com / admin123, Customer: rahim@gmail.com / customer123)');

  // 2. Categories
  const categories = [
    {
      id: 1,
      name: 'Sneakers',
      slug: 'sneakers',
      description: 'Streetwear, lifestyle sneakers and limited edition kicks.',
      image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      display_order: 1,
    },
    {
      id: 2,
      name: 'Sports Shoes',
      slug: 'sports-shoes',
      description: 'Engineered for running, gym, turf, and outdoor performance.',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      display_order: 2,
    },
    {
      id: 3,
      name: 'Formal Shoes',
      slug: 'formal-shoes',
      description: 'Premium handcrafted leather Oxfords, Derbies, and Monk straps.',
      image_url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
      display_order: 3,
    },
    {
      id: 4,
      name: 'Casual Shoes',
      slug: 'casual-shoes',
      description: 'Everyday comfortable loafers, slip-ons, and canvas shoes.',
      image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
      display_order: 4,
    },
    {
      id: 5,
      name: 'Sandals & Slides',
      slug: 'sandals-slides',
      description: 'Breathable leather sandals, sliders, and flip-flops.',
      image_url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80',
      display_order: 5,
    },
    {
      id: 6,
      name: 'Men',
      slug: 'men',
      description: "Complete footwear selection for men's fashion and function.",
      image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      display_order: 6,
    },
    {
      id: 7,
      name: 'Women',
      slug: 'women',
      description: "Chic sneakers, athletic shoes, and casual elegance for women.",
      image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      display_order: 7,
    },
    {
      id: 8,
      name: 'Kids',
      slug: 'kids',
      description: 'Durable, lightweight, and fun shoes for young explorers.',
      image_url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80',
      display_order: 8,
    },
  ];

  for (const cat of categories) {
    await db.run(
      `INSERT OR REPLACE INTO categories (id, name, slug, description, image_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cat.id, cat.name, cat.slug, cat.description, cat.image_url, cat.display_order]
    );
  }
  console.log('✅ Categories seeded');

  // 3. Brands
  const brands = [
    { id: 1, name: 'Nike', slug: 'nike', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', description: 'Just Do It. Iconic athletic footwear and streetwear.' },
    { id: 2, name: 'Adidas', slug: 'adidas', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', description: 'Through sport, we have the power to change lives.' },
    { id: 3, name: 'Puma', slug: 'puma', logo_url: 'https://upload.wikimedia.org/wikipedia/en/3/36/Puma_AG.svg', description: 'Forever Faster. German sports footwear innovation.' },
    { id: 4, name: 'New Balance', slug: 'new-balance', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg', description: 'Fearlessly Independent Since 1906.' },
    { id: 5, name: 'Jordan', slug: 'jordan', logo_url: 'https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg', description: 'The legendary Jumpman basketball and lifestyle collection.' },
    { id: 6, name: 'Apex Footwear', slug: 'apex', logo_url: 'https://apexfootwearltd.com/images/logo.png', description: 'Leading Bangladeshi footwear brand crafting genuine leather shoes.' },
    { id: 7, name: 'Bata Bangladesh', slug: 'bata', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Bata_logo.svg', description: 'Trusted shoe heritage with supreme comfort for decades in Bangladesh.' },
    { id: 8, name: 'Lotto', slug: 'lotto', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Lotto_Sport_Italia_logo.svg', description: 'Italian sportswear and performance running shoes.' },
  ];

  for (const b of brands) {
    await db.run(
      `INSERT OR REPLACE INTO brands (id, name, slug, logo_url, description)
       VALUES (?, ?, ?, ?, ?)`,
      [b.id, b.name, b.slug, b.logo_url, b.description]
    );
  }
  console.log('✅ Brands seeded');

  // 4. Delivery Settings
  await db.run(
    `INSERT OR REPLACE INTO delivery_settings (id, inside_dhaka_fee, outside_dhaka_fee, free_delivery_threshold, estimated_days_inside_dhaka, estimated_days_outside_dhaka)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [1, 80, 150, 4000, '1-2 Days (Express)', '2-4 Days (Courier)']
  );
  console.log('✅ Delivery settings seeded');

  // 5. Coupons
  const coupons = [
    { code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, min_order_amount: 1500, max_discount_amount: 500, usage_limit: 500, is_active: 1 },
    { code: 'JUTAR150', discount_type: 'fixed', discount_value: 150, min_order_amount: 2000, max_discount_amount: 150, usage_limit: 1000, is_active: 1 },
    { code: 'EID2026', discount_type: 'percentage', discount_value: 15, min_order_amount: 3500, max_discount_amount: 1200, usage_limit: 300, is_active: 1 },
    { code: 'DHAKAFREE', discount_type: 'fixed', discount_value: 80, min_order_amount: 2500, max_discount_amount: 80, usage_limit: 100, is_active: 1 },
  ];

  for (const c of coupons) {
    await db.run(
      `INSERT OR REPLACE INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [c.code, c.discount_type, c.discount_value, c.min_order_amount, c.max_discount_amount, c.usage_limit, c.is_active]
    );
  }
  console.log('✅ Coupons seeded');

  // 6. Banners
  const banners = [
    {
      title: 'ICONIC SNEAKER DROP',
      subtitle: 'Exclusive Air Jordan & Dunks now available in Bangladesh with 100% authenticity guarantee.',
      badge: 'LIMITED EDITION',
      image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1600&q=80',
      link_url: '/shop?category=sneakers',
      button_text: 'Explore Kicks',
      display_order: 1,
    },
    {
      title: 'SUPREME LEATHER CRAFT',
      subtitle: 'Hand-burnished Italian finish Oxford & Derby formal shoes by Apex and handcrafted local artisans.',
      badge: 'PREMIUM LEATHER',
      image_url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1600&q=80',
      link_url: '/shop?category=formal-shoes',
      button_text: 'Shop Formals',
      display_order: 2,
    },
    {
      title: 'NATIONWIDE CASH ON DELIVERY',
      subtitle: 'Deliveries to all 64 districts in Bangladesh with 7-day hassle-free size replacement.',
      badge: 'FAST DISPATCH',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
      link_url: '/shop',
      button_text: 'Order Now',
      display_order: 3,
    },
  ];

  for (const ban of banners) {
    await db.run(
      `INSERT OR REPLACE INTO banners (title, subtitle, badge, image_url, link_url, button_text, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [ban.title, ban.subtitle, ban.badge, ban.image_url, ban.link_url, ban.button_text, ban.display_order]
    );
  }
  console.log('✅ Banners seeded');

  // 7. Shoe Products with realistic data & images
  const sampleProducts = [
    {
      id: 1,
      name: "Nike Air Jordan 1 Retro High 'Chicago Lost & Found'",
      slug: 'nike-air-jordan-1-retro-high-chicago',
      sku: 'DZ5485-612',
      brand_id: 5, // Jordan
      category_id: 1, // Sneakers
      regular_price: 19500,
      sale_price: 16800,
      short_description: 'The iconic 1985 Chicago colorway with aged accents, premium cracked leather, and timeless silhouette.',
      description: "The Air Jordan 1 Retro High OG 'Chicago Lost & Found' brings back the iconic high-top basketball sneaker in its original 1985 colors. Featuring pre-yellowed midsoles, cracked leather collars, and a vintage box design that pays homage to sneaker hunts of the 80s. Made with genuine leather, encapsulated Air cushioning, and solid rubber traction.",
      gender: 'Unisex',
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 1,
      images: [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=80',
      ],
      variants: [
        { size: '40', color: 'Varsity Red / Black / White', color_hex: '#BA0C2F', sku: 'DZ5485-612-40', stock: 4 },
        { size: '41', color: 'Varsity Red / Black / White', color_hex: '#BA0C2F', sku: 'DZ5485-612-41', stock: 6 },
        { size: '42', color: 'Varsity Red / Black / White', color_hex: '#BA0C2F', sku: 'DZ5485-612-42', stock: 8 },
        { size: '43', color: 'Varsity Red / Black / White', color_hex: '#BA0C2F', sku: 'DZ5485-612-43', stock: 5 },
        { size: '44', color: 'Varsity Red / Black / White', color_hex: '#BA0C2F', sku: 'DZ5485-612-44', stock: 2 },
      ]
    },
    {
      id: 2,
      name: 'Nike Air Max 270 Black & Hyper Orange',
      slug: 'nike-air-max-270-black-orange',
      sku: 'AH8050-008',
      brand_id: 1, // Nike
      category_id: 2, // Sports Shoes
      regular_price: 13500,
      sale_price: 11200,
      short_description: "Nike's biggest heel Air unit provides super-soft bounce with breathable knit upper.",
      description: "Nike Air Max 270 delivers unrivaled comfort all day long. The sleek, running-inspired design roots you to Nike DNA, while the super-breathable mesh keeps your feet cool under the Dhaka sun. Boasts an extra-large 270 Max Air bubble in striking Hyper Orange against triple-black textiles.",
      gender: 'Men',
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 0,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=1000&q=80',
      ],
      variants: [
        { size: '40', color: 'Black / Orange Glow', color_hex: '#FF5A1F', sku: 'AH8050-008-40', stock: 7 },
        { size: '41', color: 'Black / Orange Glow', color_hex: '#FF5A1F', sku: 'AH8050-008-41', stock: 9 },
        { size: '42', color: 'Black / Orange Glow', color_hex: '#FF5A1F', sku: 'AH8050-008-42', stock: 3 },
        { size: '43', color: 'Black / Orange Glow', color_hex: '#FF5A1F', sku: 'AH8050-008-43', stock: 4 },
        { size: '41', color: 'Triple Black', color_hex: '#111111', sku: 'AH8050-001-41', stock: 5 },
        { size: '42', color: 'Triple Black', color_hex: '#111111', sku: 'AH8050-001-42', stock: 6 },
      ]
    },
    {
      id: 3,
      name: 'Adidas Ultraboost Light Running Shoes',
      slug: 'adidas-ultraboost-light-running',
      sku: 'HQ6351',
      brand_id: 2, // Adidas
      category_id: 2, // Sports Shoes
      regular_price: 15200,
      sale_price: 13900,
      short_description: '30% lighter BOOST material delivers maximum energy return with Primeknit+ upper.',
      description: "Experience epic energy return with the new Ultraboost Light, our lightest BOOST ever. The midsole is packed with microscopic capsules that burst with energy with every stride. Perfect for morning runs around Hatirjheel or gym workouts across Bangladesh.",
      gender: 'Unisex',
      is_featured: 1,
      is_trending: 0,
      is_new_arrival: 1,
      images: [
        'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
      ],
      variants: [
        { size: '41', color: 'Core Black / Cloud White', color_hex: '#1C1C1E', sku: 'HQ6351-41', stock: 8 },
        { size: '42', color: 'Core Black / Cloud White', color_hex: '#1C1C1E', sku: 'HQ6351-42', stock: 10 },
        { size: '43', color: 'Core Black / Cloud White', color_hex: '#1C1C1E', sku: 'HQ6351-43', stock: 6 },
        { size: '44', color: 'Core Black / Cloud White', color_hex: '#1C1C1E', sku: 'HQ6351-44', stock: 2 },
      ]
    },
    {
      id: 4,
      name: 'New Balance 550 Vintage White & Evergreen',
      slug: 'new-balance-550-white-green',
      sku: 'BB550WT1',
      brand_id: 4, // New Balance
      category_id: 1, // Sneakers
      regular_price: 12800,
      sale_price: 10500,
      short_description: 'Tribute to 90s pro basketballers with clean leather panels and vintage aesthetics.',
      description: "The 550 debuted in 1989 and left its mark on basketball courts from coast to coast. After being filed away in the archives, the 550 was reintroduced in limited-edition releases in late 2020 and quickly became a global streetwear sensation. Features premium leather construction and vintage off-white soles.",
      gender: 'Unisex',
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 1,
      images: [
        'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=80',
      ],
      variants: [
        { size: '40', color: 'White / Forest Green', color_hex: '#1B4D3E', sku: 'BB550WT1-40', stock: 5 },
        { size: '41', color: 'White / Forest Green', color_hex: '#1B4D3E', sku: 'BB550WT1-41', stock: 7 },
        { size: '42', color: 'White / Forest Green', color_hex: '#1B4D3E', sku: 'BB550WT1-42', stock: 8 },
        { size: '43', color: 'White / Forest Green', color_hex: '#1B4D3E', sku: 'BB550WT1-43', stock: 4 },
      ]
    },
    {
      id: 5,
      name: 'Apex Handcrafted Italian Leather Oxford',
      slug: 'apex-handcrafted-italian-leather-oxford',
      sku: 'APX-OXF-001',
      brand_id: 6, // Apex
      category_id: 3, // Formal Shoes
      regular_price: 6800,
      sale_price: 5450,
      short_description: 'Full-grain calfskin leather with Goodyear-welted look and anti-slip rubber outsole.',
      description: "Engineered by master cobblers at Apex Footwear Bangladesh, these handcrafted Oxford shoes are made from hand-selected 100% full-grain leather. Finished with deep burnishing, elegant brogue medallion detailing on the toe, cushioned latex insoles, and reinforced heel counter for corporate and festive occasions.",
      gender: 'Men',
      is_featured: 1,
      is_trending: 0,
      is_new_arrival: 1,
      images: [
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=80',
      ],
      variants: [
        { size: '39', color: 'Burnished Tan Brown', color_hex: '#7A3E1D', sku: 'APX-OXF-001-39', stock: 4 },
        { size: '40', color: 'Burnished Tan Brown', color_hex: '#7A3E1D', sku: 'APX-OXF-001-40', stock: 9 },
        { size: '41', color: 'Burnished Tan Brown', color_hex: '#7A3E1D', sku: 'APX-OXF-001-41', stock: 12 },
        { size: '42', color: 'Burnished Tan Brown', color_hex: '#7A3E1D', sku: 'APX-OXF-001-42', stock: 11 },
        { size: '43', color: 'Burnished Tan Brown', color_hex: '#7A3E1D', sku: 'APX-OXF-001-43', stock: 5 },
        { size: '40', color: 'Classic Black', color_hex: '#0A0A0A', sku: 'APX-OXF-002-40', stock: 6 },
        { size: '41', color: 'Classic Black', color_hex: '#0A0A0A', sku: 'APX-OXF-002-41', stock: 8 },
        { size: '42', color: 'Classic Black', color_hex: '#0A0A0A', sku: 'APX-OXF-002-42', stock: 7 },
      ]
    },
    {
      id: 6,
      name: 'Bata Comfit Breathable Moccasin Loafers',
      slug: 'bata-comfit-breathable-moccasin-loafers',
      sku: 'BAT-CMF-402',
      brand_id: 7, // Bata
      category_id: 4, // Casual Shoes
      regular_price: 3600,
      sale_price: 2990,
      short_description: 'Memory foam insole with lightweight flexible sole for effortless daily wear.',
      description: "Slip into sheer comfort with Bata Comfit Moccasin Loafers. Designed for executive professionals and casual weekend outings, this pair features ultra-soft synthetic suede leather, a shock-absorbing memory foam footbed, and micro-perforations that provide airflow in warm weather.",
      gender: 'Men',
      is_featured: 0,
      is_trending: 1,
      is_new_arrival: 0,
      images: [
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80',
      ],
      variants: [
        { size: '40', color: 'Mocha Brown', color_hex: '#4A2E18', sku: 'BAT-CMF-402-40', stock: 6 },
        { size: '41', color: 'Mocha Brown', color_hex: '#4A2E18', sku: 'BAT-CMF-402-41', stock: 10 },
        { size: '42', color: 'Mocha Brown', color_hex: '#4A2E18', sku: 'BAT-CMF-402-42', stock: 7 },
        { size: '43', color: 'Mocha Brown', color_hex: '#4A2E18', sku: 'BAT-CMF-402-43', stock: 3 },
        { size: '41', color: 'Midnight Navy', color_hex: '#1B263B', sku: 'BAT-CMF-403-41', stock: 5 },
        { size: '42', color: 'Midnight Navy', color_hex: '#1B263B', sku: 'BAT-CMF-403-42', stock: 6 },
      ]
    },
    {
      id: 7,
      name: "Apex Men's Genuine Leather Two-Strap Sandal",
      slug: 'apex-mens-genuine-leather-two-strap-sandal',
      sku: 'APX-SND-115',
      brand_id: 6, // Apex
      category_id: 5, // Sandals & Slides
      regular_price: 2450,
      sale_price: 1990,
      short_description: 'Double buckle genuine leather straps with ergonomic cork-bed footbed.',
      description: "Stay cool and comfortable with Apex genuine leather slides. Features dual adjustable buckles for a custom fit, anatomically contoured footbed that supports your arches, and high-abrasion rubber outsole suited for Dhaka pavement and monsoon rains.",
      gender: 'Men',
      is_featured: 0,
      is_trending: 1,
      is_new_arrival: 1,
      images: [
        'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80',
      ],
      variants: [
        { size: '39', color: 'Dark Saddle Brown', color_hex: '#3D2314', sku: 'APX-SND-115-39', stock: 5 },
        { size: '40', color: 'Dark Saddle Brown', color_hex: '#3D2314', sku: 'APX-SND-115-40', stock: 8 },
        { size: '41', color: 'Dark Saddle Brown', color_hex: '#3D2314', sku: 'APX-SND-115-41', stock: 12 },
        { size: '42', color: 'Dark Saddle Brown', color_hex: '#3D2314', sku: 'APX-SND-115-42', stock: 9 },
        { size: '43', color: 'Dark Saddle Brown', color_hex: '#3D2314', sku: 'APX-SND-115-43', stock: 4 },
      ]
    },
    {
      id: 8,
      name: 'Nike Dunk Low Retro White Black (Panda)',
      slug: 'nike-dunk-low-retro-white-black-panda',
      sku: 'DD1391-100',
      brand_id: 1, // Nike
      category_id: 1, // Sneakers
      regular_price: 14500,
      sale_price: 12200,
      short_description: 'The viral black and white colorway that goes with literally any outfit.',
      description: "Created for the hardwood but taken to the streets, the 80s b-ball icon returns with perfectly shined overlays and classic team colors. With its iconic hoops design, the Nike Dunk Low channels vintage style back onto the streets while its padded, low-cut collar lets you take your game anywhere in comfort.",
      gender: 'Unisex',
      is_featured: 1,
      is_trending: 1,
      is_new_arrival: 0,
      images: [
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
      ],
      variants: [
        { size: '39', color: 'Panda White / Black', color_hex: '#FFFFFF', sku: 'DD1391-100-39', stock: 3 },
        { size: '40', color: 'Panda White / Black', color_hex: '#FFFFFF', sku: 'DD1391-100-40', stock: 5 },
        { size: '41', color: 'Panda White / Black', color_hex: '#FFFFFF', sku: 'DD1391-100-41', stock: 7 },
        { size: '42', color: 'Panda White / Black', color_hex: '#FFFFFF', sku: 'DD1391-100-42', stock: 6 },
        { size: '43', color: 'Panda White / Black', color_hex: '#FFFFFF', sku: 'DD1391-100-43', stock: 4 },
      ]
    },
    {
      id: 9,
      name: 'Puma RS-X Triple White Chunky Sneakers',
      slug: 'puma-rs-x-triple-white-sneakers',
      sku: '369579-02',
      brand_id: 3, // Puma
      category_id: 1, // Sneakers
      regular_price: 11000,
      sale_price: 8900,
      short_description: 'Extreme retro Running System silhouette with exaggerated midsole cushioning.',
      description: "The RS-X is all about extreme reinvention. Featuring an ultra-modern silhouette with a bulky, exaggerated look, retro RS cushioning tech in the midsole, and multi-textile layered mesh and synthetic leather overlays. A statement sneaker for the trendsetters.",
      gender: 'Unisex',
      is_featured: 0,
      is_trending: 1,
      is_new_arrival: 1,
      images: [
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=80',
      ],
      variants: [
        { size: '40', color: 'Triple White', color_hex: '#F8F9FA', sku: '369579-02-40', stock: 4 },
        { size: '41', color: 'Triple White', color_hex: '#F8F9FA', sku: '369579-02-41', stock: 8 },
        { size: '42', color: 'Triple White', color_hex: '#F8F9FA', sku: '369579-02-42', stock: 6 },
        { size: '43', color: 'Triple White', color_hex: '#F8F9FA', sku: '369579-02-43', stock: 5 },
      ]
    },
    {
      id: 10,
      name: 'Bata Kids LED Flash Light-Up Sports Shoes',
      slug: 'bata-kids-led-flash-sports-shoes',
      sku: 'BAT-KID-701',
      brand_id: 7, // Bata
      category_id: 8, // Kids
      regular_price: 2200,
      sale_price: 1850,
      short_description: 'Fun motion-activated LED lights in heel, hook-and-loop strap for easy on/off.',
      description: "Make every step fun! These Bata kids sneakers light up on every heel strike. Designed with non-marking grip rubber, featherlight EVA midsole, and convenient velcro closures so young kids can wear them independently.",
      gender: 'Kids',
      is_featured: 0,
      is_trending: 0,
      is_new_arrival: 1,
      images: [
        'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
      ],
      variants: [
        { size: '28', color: 'Electric Blue / Orange', color_hex: '#0055FF', sku: 'BAT-KID-701-28', stock: 6 },
        { size: '30', color: 'Electric Blue / Orange', color_hex: '#0055FF', sku: 'BAT-KID-701-30', stock: 8 },
        { size: '32', color: 'Electric Blue / Orange', color_hex: '#0055FF', sku: 'BAT-KID-701-32', stock: 5 },
        { size: '34', color: 'Electric Blue / Orange', color_hex: '#0055FF', sku: 'BAT-KID-701-34', stock: 4 },
      ]
    },
    {
      id: 11,
      name: 'Lotto SpeedFlow Pro Carbon Running Shoes',
      slug: 'lotto-speedflow-pro-carbon-running',
      sku: 'LOT-SPD-88',
      brand_id: 8, // Lotto
      category_id: 2, // Sports Shoes
      regular_price: 5200,
      sale_price: 4350,
      short_description: 'Aerodynamic mesh, carbon torsion plate, high responsiveness for road marathon.',
      description: "Designed for competitive runners across Bangladesh, the Lotto SpeedFlow Pro features an engineered jacquard mesh upper for maximum breathability in humid weather, coupled with responsive dual-density cushioning that propelled runners forward with less muscle fatigue.",
      gender: 'Men',
      is_featured: 0,
      is_trending: 1,
      is_new_arrival: 1,
      images: [
        'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
      ],
      variants: [
        { size: '40', color: 'Fluro Neon / Charcoal', color_hex: '#CCFF00', sku: 'LOT-SPD-88-40', stock: 4 },
        { size: '41', color: 'Fluro Neon / Charcoal', color_hex: '#CCFF00', sku: 'LOT-SPD-88-41', stock: 8 },
        { size: '42', color: 'Fluro Neon / Charcoal', color_hex: '#CCFF00', sku: 'LOT-SPD-88-42', stock: 7 },
        { size: '43', color: 'Fluro Neon / Charcoal', color_hex: '#CCFF00', sku: 'LOT-SPD-88-43', stock: 3 },
      ]
    },
    {
      id: 12,
      name: "Apex Women's Slip-On Woven Casual Sneaker",
      slug: 'apex-womens-slip-on-woven-casual-sneaker',
      sku: 'APX-WMN-330',
      brand_id: 6, // Apex
      category_id: 7, // Women
      regular_price: 3800,
      sale_price: 3150,
      short_description: 'Ultra-flexible knit woven slip-on with soft heel cushion for daily college and office.',
      description: "Crafted for stylish comfort on the go, this Apex slip-on sneaker features an elastic sock-like woven collar, lightweight shock-absorbing outsole, and clean minimalist lines. Pairs effortlessly with kurti, jeans, or western formal wear.",
      gender: 'Women',
      is_featured: 1,
      is_trending: 0,
      is_new_arrival: 1,
      images: [
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=80',
      ],
      variants: [
        { size: '36', color: 'Dusty Rose Pink', color_hex: '#DCAE96', sku: 'APX-WMN-330-36', stock: 5 },
        { size: '37', color: 'Dusty Rose Pink', color_hex: '#DCAE96', sku: 'APX-WMN-330-37', stock: 8 },
        { size: '38', color: 'Dusty Rose Pink', color_hex: '#DCAE96', sku: 'APX-WMN-330-38', stock: 9 },
        { size: '39', color: 'Dusty Rose Pink', color_hex: '#DCAE96', sku: 'APX-WMN-330-39', stock: 4 },
        { size: '37', color: 'Oatmeal Beige', color_hex: '#E3DAC9', sku: 'APX-WMN-331-37', stock: 6 },
        { size: '38', color: 'Oatmeal Beige', color_hex: '#E3DAC9', sku: 'APX-WMN-331-38', stock: 5 },
      ]
    }
  ];

  for (const prod of sampleProducts) {
    await db.run(
      `INSERT OR REPLACE INTO products (id, name, slug, sku, brand_id, category_id, regular_price, sale_price, description, short_description, gender, is_featured, is_trending, is_new_arrival, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        prod.id,
        prod.name,
        prod.slug,
        prod.sku,
        prod.brand_id,
        prod.category_id,
        prod.regular_price,
        prod.sale_price,
        prod.description,
        prod.short_description,
        prod.gender,
        prod.is_featured,
        prod.is_trending,
        prod.is_new_arrival,
      ]
    );

    // Insert Images
    await db.run('DELETE FROM product_images WHERE product_id = ?', [prod.id]);
    for (let i = 0; i < prod.images.length; i++) {
      await db.run(
        `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
         VALUES (?, ?, ?, ?)`,
        [prod.id, prod.images[i], i === 0 ? 1 : 0, i]
      );
    }

    // Insert Variants
    await db.run('DELETE FROM product_variants WHERE product_id = ?', [prod.id]);
    for (const v of prod.variants) {
      await db.run(
        `INSERT INTO product_variants (product_id, size, color, color_hex, sku, stock_quantity, additional_price)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [prod.id, v.size, v.color, v.color_hex, v.sku, v.stock]
      );
    }
  }
  console.log(`✅ ${sampleProducts.length} Products with images & size/color inventory variants seeded`);

  // 8. Sample Reviews
  const reviews = [
    {
      product_id: 1,
      user_id: 2,
      user_name: 'Rahim Ahmed',
      rating: 5,
      comment: 'Authentic Chicago 1s! Got delivered to Banani in 24 hours. The leather quality and aged finish are unbelievable.',
    },
    {
      product_id: 1,
      user_id: 2,
      user_name: 'Tanvir Hossain',
      rating: 5,
      comment: 'Best sneaker shop in BD hands down. Packaging had double-box protection and size 42 fits true to size.',
    },
    {
      product_id: 2,
      user_id: 2,
      user_name: 'Sadman Sakib',
      rating: 5,
      comment: 'Super comfortable air bubble. The orange accent looks much better in person than the photo.',
    },
    {
      product_id: 5,
      user_id: 2,
      user_name: 'Farhan Kabir',
      rating: 5,
      comment: 'Apex craftsmanship is top notch. Wore it to a wedding in Dhanmondi and got tons of compliments.',
    },
  ];

  for (const r of reviews) {
    await db.run(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, comment, is_approved)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [r.product_id, r.user_id, r.user_name, r.rating, r.comment]
    );
  }
  console.log('✅ Reviews seeded');

  // 9. Sample Initial Orders for Admin Dashboard reporting
  const sampleOrders = [
    {
      order_number: 'JG-2026-10001',
      customer_id: 2,
      customer_name: 'Rahim Ahmed',
      customer_phone: '01712345678',
      customer_email: 'rahim@gmail.com',
      district: 'Dhaka',
      area: 'Banani',
      full_address: 'House 42, Road 11, Block D, Banani, Dhaka-1213',
      payment_method: 'cod',
      payment_status: 'paid',
      order_status: 'delivered',
      subtotal: 16800,
      delivery_fee: 80,
      discount: 500,
      coupon_code: 'WELCOME10',
      total_amount: 16380,
      items: [
        {
          product_id: 1,
          product_name: "Nike Air Jordan 1 Retro High 'Chicago Lost & Found'",
          product_image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
          size: '42',
          color: 'Varsity Red / Black / White',
          price: 16800,
          quantity: 1,
          total: 16800,
        }
      ]
    },
    {
      order_number: 'JG-2026-10002',
      customer_id: 2,
      customer_name: 'Nasir Uddin',
      customer_phone: '01819998877',
      customer_email: 'nasir.ctg@yahoo.com',
      district: 'Chittagong',
      area: 'GEC Circle',
      full_address: 'Flat 4B, Hill View Tower, Nasirabad, Chittagong',
      payment_method: 'bkash',
      payment_status: 'paid',
      order_status: 'shipped',
      subtotal: 11200,
      delivery_fee: 150,
      discount: 0,
      coupon_code: null,
      total_amount: 11350,
      bkash_transaction_id: 'BK9X7781AA',
      items: [
        {
          product_id: 2,
          product_name: 'Nike Air Max 270 Black & Hyper Orange',
          product_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
          size: '41',
          color: 'Black / Orange Glow',
          price: 11200,
          quantity: 1,
          total: 11200,
        }
      ]
    },
    {
      order_number: 'JG-2026-10003',
      customer_id: null,
      customer_name: 'Mohammad Tariqul',
      customer_phone: '01923456789',
      customer_email: 'tariqul@outlook.com',
      district: 'Sylhet',
      area: 'Zindabazar',
      full_address: 'Holding 14, Amberkhana Road, Sylhet',
      payment_method: 'cod',
      payment_status: 'unpaid',
      order_status: 'pending',
      subtotal: 5450,
      delivery_fee: 150,
      discount: 150,
      coupon_code: 'JUTAR150',
      total_amount: 5450,
      items: [
        {
          product_id: 5,
          product_name: 'Apex Handcrafted Italian Leather Oxford',
          product_image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=80',
          size: '41',
          color: 'Burnished Tan Brown',
          price: 5450,
          quantity: 1,
          total: 5450,
        }
      ]
    }
  ];

  for (const o of sampleOrders) {
    const res = await db.run(
      `INSERT OR REPLACE INTO orders (order_number, customer_id, customer_name, customer_phone, customer_email, district, area, full_address, payment_method, payment_status, order_status, subtotal, delivery_fee, discount, coupon_code, total_amount, bkash_transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o.order_number,
        o.customer_id,
        o.customer_name,
        o.customer_phone,
        o.customer_email,
        o.district,
        o.area,
        o.full_address,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.subtotal,
        o.delivery_fee,
        o.discount,
        o.coupon_code,
        o.total_amount,
        o.bkash_transaction_id || null,
      ]
    );

    const orderId = res.lastID;
    for (const it of o.items) {
      await db.run(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, size, color, price, quantity, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, it.product_id, it.product_name, it.product_image, it.size, it.color, it.price, it.quantity, it.total]
      );
    }
  }
  console.log('✅ Sample orders seeded');

  console.log('🎉 Database seeding completed successfully!');
}

// Allow standalone execution
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seed error:', err);
      process.exit(1);
    });
}
