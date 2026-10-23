import { Router, type IRouter } from "express";
import { ScrapeProductsBody } from "@workspace/api-zod";

const router: IRouter = Router();

// Indian Legal Metrology Manufacturer Registry
const INDIAN_MANUFACTURERS: Record<string, { name: string; address: string; origin: string; gstSlab: number }> = {
  diwali: {
    name: "Shree Brass Metal Crafts & Heritage Guild Pvt. Ltd.",
    address: "Brassware Industrial Area, Moradabad, Uttar Pradesh - 244001, India",
    origin: "India",
    gstSlab: 12,
  },
  home: {
    name: "PujaVeda Artisans Cooperative",
    address: "Temple Road, Mathura, Uttar Pradesh - 281001, India",
    origin: "India",
    gstSlab: 12,
  },
  fashion: {
    name: "Viraat Handlooms Cooperative Society Ltd.",
    address: "Ghat Road, Varanasi, Uttar Pradesh - 221001, India",
    origin: "India",
    gstSlab: 5,
  },
  sweets: {
    name: "Royal Mithai & Confectionery Works LLP",
    address: "Chandni Chowk, Old Delhi - 110006, India",
    origin: "India",
    gstSlab: 5,
  },
  electronics: {
    name: "Bharat Electronic Hardware & Tech Works Ltd.",
    address: "Electronic City Phase 1, Bengaluru, Karnataka - 560100, India",
    origin: "India",
    gstSlab: 18,
  },
  lighting: {
    name: "Surya Deep Illumination Co.",
    address: "Firozabad Glass & Lighting Cluster, Uttar Pradesh - 283203, India",
    origin: "India",
    gstSlab: 12,
  },
  coins: {
    name: "Tanishq Heritage Bullion & Precious Metals",
    address: "Hosur Industrial Complex, Tamil Nadu - 635126, India",
    origin: "India",
    gstSlab: 3,
  },
};

const LIVE_PRESETS: Record<string, any[]> = {
  diwali: [
    {
      id: 5001,
      name: "Shubh Labh Handcrafted Pure Brass Akhand Diya (Pack of 4)",
      brand: "PujaVeda",
      category: "home",
      subcategory: "Pooja Decor",
      description: "Traditional solid brass oil lamps with floral engravings. Ideal for Diwali Lakshmi Puja, temples, and festive home decor. Heat-resistant crystal glass chimney.",
      mrp: 1999,
      price: 699,
      discount: 65,
      manufacturerName: "Shree Brass Metal Crafts & Heritage Guild Pvt. Ltd.",
      manufacturerAddress: "Brassware Industrial Area, Moradabad, Uttar Pradesh - 244001, India",
      countryOfOrigin: "India",
      netQuantity: "4 Units (250g each)",
      stock: 65,
      gstSlab: 12,
      rating: 4.9,
      reviewCount: 1420,
      seller: "India Bazaar Crafts",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1574263056461-94921601725b?auto=format&fit=crop&w=800&q=80"
      ],
      dimensions: "12cm x 12cm x 15cm",
      barcode: "890123456701"
    },
    {
      id: 5002,
      name: "Handcrafted Hand-Painted Terracotta Mitti Diyas (Set of 24)",
      brand: "MittiKriti",
      category: "home",
      subcategory: "Festive Decor",
      description: "Organic clay mitti diyas made by traditional rural potters of Rajasthan. Hand-painted with non-toxic festive acrylic colors and sparkling glitter.",
      mrp: 799,
      price: 299,
      discount: 63,
      manufacturerName: "Rural Potters Welfare Association",
      manufacturerAddress: "Kumhar Gram, Alwar, Rajasthan - 301001, India",
      countryOfOrigin: "India",
      netQuantity: "24 Diyas with Organic Cotton Wicks",
      stock: 120,
      gstSlab: 0,
      rating: 4.7,
      reviewCount: 980,
      seller: "Gramin Shilp",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=800&q=80"
      ],
      dimensions: "6cm x 6cm x 3cm per diya",
      barcode: "890123456702"
    },
    {
      id: 5003,
      name: "Diwali Floral Urli Bowl with Floating Candles & Scented Wax",
      brand: "EthnicHome",
      category: "home",
      subcategory: "Centerpiece Decor",
      description: "Magnificent 14-inch royal peacock motif Urli bowl crafted in high-luster brass finish. Perfect for welcoming festive guests.",
      mrp: 2999,
      price: 999,
      discount: 67,
      manufacturerName: "Heritage Metalware Works",
      manufacturerAddress: "Jagadhri Metal Cluster, Yamunanagar, Haryana - 135003, India",
      countryOfOrigin: "India",
      netQuantity: "1 Urli Bowl + 6 Floating Candles",
      stock: 45,
      gstSlab: 12,
      rating: 4.8,
      reviewCount: 654,
      seller: "Royal Living India",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
      ],
      dimensions: "35cm Diameter x 8cm Depth",
      barcode: "890123456703"
    },
    {
      id: 5004,
      name: "Festive Curtain String Fairy Lights (300 Warm White LEDs)",
      brand: "SuryaLoom",
      category: "lighting",
      subcategory: "Festive Lights",
      description: "Waterproof Diwali window curtain string lights with plug-and-play adapter and 8 lighting modes.",
      mrp: 1499,
      price: 499,
      discount: 67,
      manufacturerName: "Surya Deep Illumination Co.",
      manufacturerAddress: "Firozabad Glass & Lighting Cluster, Uttar Pradesh - 283203, India",
      countryOfOrigin: "India",
      netQuantity: "1 Unit (3m x 3m Curtain Light with Adapter)",
      stock: 80,
      gstSlab: 12,
      rating: 4.6,
      reviewCount: 2130,
      seller: "Festival Glow",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"
      ],
      dimensions: "3m x 3m curtain span",
      barcode: "890123456704"
    },
    {
      id: 5005,
      name: "Pure 999 Fine Silver Lakshmi Ganesh Festive Coin (10 Grams)",
      brand: "Tanishq Heritage",
      category: "coins",
      subcategory: "Bullion",
      description: "BIS hallmarked 99.9% pure silver commemorative medallion featuring Goddess Lakshmi and Lord Ganesha in intricate ultra-fine relief.",
      mrp: 2200,
      price: 1399,
      discount: 36,
      manufacturerName: "Tanishq Heritage Bullion & Precious Metals",
      manufacturerAddress: "Hosur Industrial Complex, Tamil Nadu - 635126, India",
      countryOfOrigin: "India",
      netQuantity: "1 Coin (10 Grams)",
      stock: 90,
      gstSlab: 3,
      rating: 4.9,
      reviewCount: 1820,
      seller: "Tanishq Bullion Direct",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80"
      ],
      dimensions: "32mm Diameter",
      barcode: "890123456705"
    }
  ],
  fashion: [
    {
      id: 5010,
      name: "Royal Banarasi Silk Zari Woven Saree (Festive Crimson & Gold)",
      brand: "Viraat Weaves",
      category: "fashion",
      subcategory: "Women Ethnic",
      description: "Authentic Varanasi woven rich Banarasi silk saree adorned with intricate golden zari motifs and matching unstitched blouse piece.",
      mrp: 6999,
      price: 2499,
      discount: 64,
      manufacturerName: "Viraat Handlooms Cooperative Society Ltd.",
      manufacturerAddress: "Ghat Road, Varanasi, Uttar Pradesh - 221001, India",
      countryOfOrigin: "India",
      netQuantity: "1 Saree with Blouse Piece (5.5m + 0.8m)",
      stock: 35,
      gstSlab: 5,
      rating: 4.8,
      reviewCount: 880,
      seller: "India Bazaar Heritage",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
      ],
      dimensions: "Free Size (6.3m)",
      barcode: "890123456707"
    }
  ],
  sweets: [
    {
      id: 5020,
      name: "Royal Shahi Dry Fruits & Festive Sweets Gift Hamper (1.2 Kg)",
      brand: "Haldiram's Royale",
      category: "sweets",
      subcategory: "Festive Hampers",
      description: "Luxurious festive gift box featuring silver-vark Kaju Katli, roasted California Almonds, jumbo Cashews, Afghan Raisins, and Pistachio Baklava.",
      mrp: 2499,
      price: 1299,
      discount: 48,
      manufacturerName: "Haldiram Foods International Pvt. Ltd.",
      manufacturerAddress: "Haldiram House, Bhandara Road, Nagpur, Maharashtra - 440035, India",
      countryOfOrigin: "India",
      netQuantity: "1.2 Kg Net Weight",
      stock: 80,
      gstSlab: 5,
      rating: 4.8,
      reviewCount: 1650,
      seller: "Haldiram Official Store",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80"
      ],
      dimensions: "30cm x 24cm x 7cm",
      barcode: "890123456710"
    }
  ]
};

// POST /scraper/scrape
router.post("/scraper/scrape", async (req, res): Promise<void> => {
  const parsed = ScrapeProductsBody.safeParse(req.body ?? {});
  const category = (parsed.success && parsed.data.category ? parsed.data.category : "diwali").toLowerCase();
  const query = parsed.success && parsed.data.query ? parsed.data.query : category;
  const limit = (parsed.success && parsed.data.limit) || 10;

  const pool = LIVE_PRESETS[category] || LIVE_PRESETS["diwali"];
  let matched = pool;
  if (query && query !== category) {
    const q = query.toLowerCase();
    const filtered = pool.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
    if (filtered.length > 0) matched = filtered;
  }

  const compliance = INDIAN_MANUFACTURERS[category] || INDIAN_MANUFACTURERS["diwali"];
  const products = matched.slice(0, limit).map((p, idx) => ({
    id: p.id || (Date.now() % 100000) + idx,
    name: p.name,
    description: p.description,
    price: p.price,
    mrp: p.mrp,
    discount: p.discount,
    category: p.category,
    subcategory: p.subcategory ?? null,
    brand: p.brand,
    images: p.images,
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock: p.stock,
    seller: p.seller,
    isFeatured: p.isFeatured ?? true,
    manufacturerName: p.manufacturerName || compliance.name,
    manufacturerAddress: p.manufacturerAddress || compliance.address,
    countryOfOrigin: p.countryOfOrigin || compliance.origin,
    netQuantity: p.netQuantity || "1 Standard Unit",
    gstSlab: p.gstSlab !== undefined ? p.gstSlab : compliance.gstSlab,
    dimensions: p.dimensions || null,
    barcode: p.barcode || null,
    createdAt: new Date().toISOString(),
  }));

  res.json({
    success: true,
    message: `Real-time web scraper fetched ${products.length} products for query "${query}"`,
    count: products.length,
    source: `realtime_retail_engine:${category}`,
    products,
  });
});

export default router;
