function toSlug(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const RAW_CATEGORIES = [
  {
    name: "PVC Pipe",
    children: ["S-Lon", "National", "Anton", "Arpico", "Phoenix", "Ambro", "Lesson"],
  },
  {
    name: "PVC Fittings",
    children: ["S-Lon", "National", "Anton", "Arpico"],
  },
  {
    name: "PVC Solvent Cement",
    children: ["S-Lon", "National", "Anton", "Arpico", "Phoenix"],
  },
  {
    name: "ERA PVC Fittings",
    children: [
      "Small Diameter Fittings",
      "Large Diameter Fittings",
      "Drainage Fittings",
      "ERA SS Handle Ball Valve",
      "ERA PVC Ball Valve",
      "ERA Foot Valve",
    ],
  },
  {
    name: "Cutting Wheel",
    children: ["PE+"],
  },
  {
    name: "Water Tap",
    children: ["Water Tec", "Plumber", "Miller"],
  },
  {
    name: "Hot Water Pipe & Fittings",
    children: ["ERA", "S-Lon", "Anton"],
  },
  {
    name: "PPR Pipe & Fittings",
    children: ["ERA", "Vasen", "S-Lon"],
  },
  {
    name: "HDPE Pipe and Fittings",
    children: ["S-Lon", "National"],
  },
  {
    name: "Water Meter",
    children: ["All Brands"],
  },
];

export const SHOP_CATEGORIES = RAW_CATEGORIES.map((cat) => ({
  name: cat.name,
  slug: toSlug(cat.name),
  children: cat.children.map((name) => ({ name, slug: toSlug(name) })),
}));

let _codeCounter = 1;
function nextCode() {
  return String(_codeCounter++).padStart(10, "0");
}

function makeProduct({ name, price, image, category, subcategory, description }) {
  return {
    name,
    slug: toSlug(name),
    productCode: nextCode(),
    price,
    image,
    category,
    categorySlug: toSlug(category),
    subcategory,
    subcategorySlug: toSlug(subcategory),
    badge: subcategory,
    description: description || "",
  };
}

export const SHOP_PRODUCTS = [
  makeProduct({
    name: "Anton Pressure Pipes (20mm) PNT 14",
    price: 562,
    image: "https://loremflickr.com/800/800/pvc,pipe?lock=11",
    category: "PVC Pipe",
    subcategory: "Anton",
    description: "Anton PNT 14 pressure pipes are designed for reliable water supply systems. Made from high-quality unplasticized PVC, these 20mm pipes offer excellent durability and resistance to corrosion. Ideal for both residential and commercial plumbing installations. Conforms to SLS standards for pressure pipe applications.",
  }),
  makeProduct({
    name: 'Anton Pressure Pipes PNT 11 (25mm (1/2") - 315mm (12"))',
    price: 1277,
    image: "https://loremflickr.com/800/800/pipe,plumbing?lock=12",
    category: "PVC Pipe",
    subcategory: "Anton",
    description: "Anton PNT 11 pressure pipes deliver outstanding performance for medium-pressure water distribution. Available in sizes from 25mm to 315mm, these pipes feature superior chemical resistance and a smooth inner surface for optimal flow. Manufactured to SLS 147 standards ensuring long-lasting, leak-free connections.",
  }),
  makeProduct({
    name: 'Anton Pressure Pipes PNT 7 (32mm (1") - 315mm (12"))',
    price: 939,
    image: "https://loremflickr.com/800/800/pvc,plumbing?lock=13",
    category: "PVC Pipe",
    subcategory: "Anton",
    description: "Anton PNT 7 pressure pipes are engineered for high-pressure water supply applications. The 32mm variant is perfect for main water lines in residential buildings. Features excellent UV resistance, lightweight construction, and easy solvent-cement jointing for quick installation.",
  }),
  makeProduct({
    name: "S-Lon PVC Pipe (100m) - Blue",
    price: 24090,
    image: "https://loremflickr.com/800/800/hdpe,pipe?lock=14",
    category: "PVC Pipe",
    subcategory: "S-Lon",
    description: "S-Lon blue PVC pipe coil provides 100 meters of premium-grade piping for large-scale water distribution projects. The distinctive blue color makes identification easy during installation. Built to withstand Sri Lankan conditions with UV-stabilized material and excellent pressure-bearing capacity.",
  }),
  makeProduct({
    name: 'S-Lon PVC Elbow 1/2"',
    price: 75,
    image: "https://loremflickr.com/800/800/pvc,fitting?lock=21",
    category: "PVC Fittings",
    subcategory: "S-Lon",
    description: 'S-Lon 1/2" PVC elbow fitting for creating 90-degree bends in your plumbing system. Made from virgin PVC material ensuring a tight, leak-proof connection with standard PVC pipes. Easy to install using solvent cement. Suitable for cold water supply lines.',
  }),
  makeProduct({
    name: "Anton PVC Tee 25mm",
    price: 120,
    image: "https://loremflickr.com/800/800/pipe,connector?lock=22",
    category: "PVC Fittings",
    subcategory: "Anton",
    description: "Anton 25mm PVC Tee connector for branching water supply lines. This T-shaped fitting allows you to split or combine water flow in plumbing systems. Manufactured from high-impact PVC for durability and long service life. Compatible with standard 25mm PVC pipes.",
  }),
  makeProduct({
    name: "Phoenix PVC Solvent Cement 200ml",
    price: 450,
    image: "https://loremflickr.com/800/800/adhesive,cement?lock=31",
    category: "PVC Solvent Cement",
    subcategory: "Phoenix",
    description: "Phoenix PVC solvent cement provides a strong, permanent bond for PVC pipe joints. The 200ml container is perfect for small to medium plumbing projects. Fast-setting formula creates watertight seals within minutes. Suitable for pressure pipe applications up to 16 bar.",
  }),
  makeProduct({
    name: "Arpico PVC Solvent Cement 500ml",
    price: 850,
    image: "https://loremflickr.com/800/800/glue,cement?lock=32",
    category: "PVC Solvent Cement",
    subcategory: "Arpico",
    description: "Arpico PVC solvent cement in a larger 500ml tin — ideal for contractors and bigger projects. Creates permanent molecular bonds between PVC pipes and fittings. The medium-bodied formula fills gaps and provides consistent joint strength. Meets SLS standards for plumbing adhesives.",
  }),
  makeProduct({
    name: "ERA Small Diameter Fitting - Elbow 20mm",
    price: 110,
    image: "https://loremflickr.com/800/800/valve,fitting?lock=41",
    category: "ERA PVC Fittings",
    subcategory: "Small Diameter Fittings",
    description: "ERA 20mm small diameter elbow fitting manufactured to international standards. Precision-molded for accurate dimensions and reliable connections. Features smooth inner walls to minimize friction loss and maintain water pressure. Suitable for both hot and cold water systems.",
  }),
  makeProduct({
    name: 'ERA SS Handle Ball Valve 1"',
    price: 1650,
    image: "https://loremflickr.com/800/800/ball,valve?lock=42",
    category: "ERA PVC Fittings",
    subcategory: "ERA SS Handle Ball Valve",
    description: 'ERA 1" ball valve with stainless steel handle for precise flow control. The full-bore design ensures unrestricted flow when fully open. PVC body with EPDM seals for excellent chemical resistance and long service life. Quarter-turn operation for quick on/off control.',
  }),
  makeProduct({
    name: 'PE+ Cutting Wheel 4" (Pack of 10)',
    price: 950,
    image: "https://loremflickr.com/800/800/cutting,wheel?lock=51",
    category: "Cutting Wheel",
    subcategory: "PE+",
    description: 'PE+ 4" cutting wheels in a pack of 10 for angle grinder use. Designed for cutting PVC pipes, metal, and general-purpose materials. Reinforced with fiberglass mesh for safety and durability. Thin profile for fast, clean cuts with minimal material waste.',
  }),
  makeProduct({
    name: 'Water Tec Tap (Bib Cock) 1/2"',
    price: 890,
    image: "https://loremflickr.com/800/800/water,tap?lock=61",
    category: "Water Tap",
    subcategory: "Water Tec",
    description: 'Water Tec 1/2" bib cock tap designed for outdoor and utility use. Chrome-plated brass body ensures corrosion resistance and an attractive finish. Smooth quarter-turn ceramic disc cartridge for drip-free operation. Easy wall-mount installation with standard BSP threading.',
  }),
  makeProduct({
    name: "Miller Sink Tap Mixer",
    price: 4950,
    image: "https://loremflickr.com/800/800/kitchen,tap?lock=62",
    category: "Water Tap",
    subcategory: "Miller",
    description: "Miller premium sink tap mixer with modern single-lever design. Dual-function swivel spout for kitchen convenience. High-quality ceramic cartridge for smooth hot/cold water blending. Chrome-plated brass construction resists tarnishing and is easy to clean. Includes all mounting hardware.",
  }),
  makeProduct({
    name: "ERA Hot Water Pipe 20mm (3m)",
    price: 1290,
    image: "https://loremflickr.com/800/800/hot,water,pipe?lock=71",
    category: "Hot Water Pipe & Fittings",
    subcategory: "ERA",
    description: "ERA 20mm CPVC hot water pipe rated for temperatures up to 93°C. The 3-meter length is ideal for residential hot water plumbing. Lightweight yet strong, with excellent thermal insulation properties. Fire-retardant material adds an extra layer of safety. Compatible with ERA CPVC fittings.",
  }),
  makeProduct({
    name: "S-Lon PPR Pipe 25mm (4m)",
    price: 1550,
    image: "https://loremflickr.com/800/800/ppr,pipe?lock=81",
    category: "PPR Pipe & Fittings",
    subcategory: "S-Lon",
    description: "S-Lon 25mm PPR (Polypropylene Random Copolymer) pipe in 4-meter lengths. Designed for both hot and cold water supply up to 95°C. The heat-fusion jointing system creates seamless, leak-proof connections that last decades. Non-toxic material safe for drinking water applications.",
  }),
  makeProduct({
    name: "Vasen PPR Elbow 20mm",
    price: 180,
    image: "https://loremflickr.com/800/800/ppr,fitting?lock=82",
    category: "PPR Pipe & Fittings",
    subcategory: "Vasen",
    description: "Vasen 20mm PPR elbow for creating 90-degree turns in PPR piping systems. Heat-fusion welded connections ensure permanent, leak-free joints. Suitable for hot and cold water with temperature resistance up to 95°C. Made from food-grade PPR material.",
  }),
  makeProduct({
    name: "National HDPE Coupler 32mm",
    price: 290,
    image: "https://loremflickr.com/800/800/hdpe,fitting?lock=91",
    category: "HDPE Pipe and Fittings",
    subcategory: "National",
    description: "National 32mm HDPE coupler for joining two sections of HDPE pipe. Butt-fusion or electrofusion welding creates a joint as strong as the pipe itself. High-density polyethylene material resists chemicals, corrosion, and ground movement. Ideal for underground water supply networks.",
  }),
  makeProduct({
    name: 'All Brands Water Meter 1/2"',
    price: 5800,
    image: "https://loremflickr.com/800/800/water,meter?lock=101",
    category: "Water Meter",
    subcategory: "All Brands",
    description: '1/2" residential water meter for accurate water consumption measurement. Multi-jet dry dial mechanism ensures reliable readings even in harsh conditions. Brass body with tempered glass cover protects the register. Conforms to ISO 4064 standards. Suitable for National Water Supply & Drainage Board connections.',
  }),
];

export function getShopCategoryBySlug(slug) {
  return SHOP_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export function getShopProductBySlug(slug) {
  return SHOP_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export function formatRs(value) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const safe = typeof num === "number" && Number.isFinite(num) ? num : 0;
  return `Rs. ${safe.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Map API item (GetAllItemsForWeb) to shop product shape for grid, quick view, and cart.
 * @param {Object} item - API item (id, name, code, averagePrice, productImage, description, categoryId, subCategoryId, itemSubImages, ...)
 * @param {string} [categoryName]
 * @param {string} [subCategoryName]
 */
export function mapApiItemToProduct(item, categoryName = "", subCategoryName = "") {
  if (!item) return null;
  const price =
    typeof item.averagePrice === "string"
      ? parseFloat(item.averagePrice)
      : Number(item.averagePrice);
  const subImages = Array.isArray(item.itemSubImages)
    ? item.itemSubImages
        .filter((s) => s && (s.imgUrl || s.imageUrl))
        .map((s) => ({
          id: s.id,
          url: s.imgUrl ?? s.imageUrl ?? "",
          description: s.description ?? "",
          price: s.price,
          isOutOfStock: !!(s.isOutOfStock ?? s.IsOutOfStock),
        }))
    : [];
  return {
    id: item.id,
    slug: `item-${item.id}`,
    name: item.name ?? "",
    productCode: item.code ?? "",
    price: Number.isFinite(price) ? price : 0,
    categoryId: item.categoryId != null ? Number(item.categoryId) : undefined,
    image: item.productImage ?? "",
    /** Main / primary image out of stock (Items.IsOutOfStock from API). */
    isOutOfStock: !!(item.isOutOfStock ?? item.IsOutOfStock),
    itemSubImages: subImages,
    category: categoryName,
    subcategory: subCategoryName,
    description: item.description ?? "",
    badge: subCategoryName || null,
  };
}

/**
 * Pick the first purchasable image/price: main image if in stock, otherwise first in-stock sub-image.
 * Used for shop grid and quick-add so a main-only OOS flag does not block subs that are available.
 *
 * @returns {{ image: string, price: number, itemSubImageId: number|null, isEntirelyOutOfStock: boolean, subDescription: string }}
 */
export function getPreferredInStockOffer(product) {
  if (!product) {
    return {
      image: "",
      price: 0,
      itemSubImageId: null,
      isEntirelyOutOfStock: true,
      subDescription: "",
    };
  }
  const priceBase =
    typeof product.price === "number" && Number.isFinite(product.price)
      ? product.price
      : parseFloat(product.price) || 0;
  const hasMainImg = !!(product.image && String(product.image).trim());
  if (hasMainImg && !product.isOutOfStock) {
    return {
      image: product.image,
      price: priceBase,
      itemSubImageId: null,
      isEntirelyOutOfStock: false,
      subDescription: "",
    };
  }
  const subs = Array.isArray(product.itemSubImages) ? product.itemSubImages : [];
  const sub = subs.find((s) => s?.url && String(s.url).trim() && !s.isOutOfStock);
  if (sub) {
    const sp =
      sub.price != null && Number.isFinite(Number(sub.price)) ? Number(sub.price) : priceBase;
    return {
      image: sub.url,
      price: sp,
      itemSubImageId: typeof sub.id === "number" ? sub.id : null,
      isEntirelyOutOfStock: false,
      subDescription: sub.description ?? "",
    };
  }
  const fallbackUrl = product.image || subs.find((s) => s?.url)?.url || "";
  return {
    image: fallbackUrl,
    price: priceBase,
    itemSubImageId: null,
    isEntirelyOutOfStock: true,
    subDescription: "",
  };
}

export function isProductEntirelyOutOfStock(product) {
  return getPreferredInStockOffer(product).isEntirelyOutOfStock;
}

/**
 * Cart line for the preferred in-stock option (main or first available sub). Null if nothing is available.
 */
export function productToCartLine(product) {
  const offer = getPreferredInStockOffer(product);
  if (offer.isEntirelyOutOfStock) return null;
  if (offer.itemSubImageId != null) {
    const desc = (offer.subDescription || "").trim();
    return {
      ...product,
      image: offer.image,
      price: offer.price,
      slug: `${product.slug}-variant-${offer.itemSubImageId}`,
      baseSlug: product.slug,
      variantDescription: offer.subDescription ?? "",
      itemSubImageId: offer.itemSubImageId,
      name: desc ? `${product.name} — ${desc}` : product.name,
      isOutOfStock: false,
    };
  }
  return {
    ...product,
    image: offer.image,
    price: offer.price,
    isOutOfStock: false,
  };
}
