import dotenv from "dotenv";
import path from "path";

const rootEnvPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: rootEnvPath });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

const seedProducts: SeedProduct[] = [
  {
    name: "Samsung Galaxy A54 5G",
    description:
      "6.4-inch Super AMOLED display, 128GB storage, 8GB RAM, 50MP triple camera, 5000mAh battery",
    price: 185000,
    category: "Electronics",
    stock: 25,
    images: ["https://example.com/images/samsung-galaxy-a54.jpg"],
  },
  {
    name: "iPhone 14 Pro",
    description:
      "6.1-inch Super Retina XDR display, 256GB storage, A16 Bionic chip, Pro camera system",
    price: 850000,
    category: "Electronics",
    stock: 15,
    images: ["https://example.com/images/iphone-14-pro.jpg"],
  },
  {
    name: "MacBook Pro 16-inch M3",
    description:
      "16.2-inch Liquid Retina XDR display, M3 Pro chip, 18GB unified memory, 512GB SSD",
    price: 3500000,
    category: "Electronics",
    stock: 8,
    images: ["https://example.com/images/macbook-pro-16.jpg"],
  },
  {
    name: "Ankara Print Dress",
    description:
      "Beautiful African print dress, 100% cotton, available in various sizes and colors",
    price: 15000,
    category: "Fashion",
    stock: 50,
    images: ["https://example.com/images/ankara-dress.jpg"],
  },
  {
    name: "Aso Ebi Set",
    description:
      "Traditional Nigerian Aso Ebi outfit set for special occasions, includes wrapper and blouse",
    price: 25000,
    category: "Fashion",
    stock: 30,
    images: ["https://example.com/images/aso-ebi-set.jpg"],
  },
  {
    name: "Nigerian Jollof Rice Seasoning",
    description:
      "Premium jollof rice seasoning mix, authentic Nigerian taste, 500g pack",
    price: 2500,
    category: "Food & Beverages",
    stock: 100,
    images: ["https://example.com/images/jollof-seasoning.jpg"],
  },
  {
    name: "Palm Oil - 5 Litres",
    description: "Pure Nigerian red palm oil, unrefined, 5 litres container",
    price: 4500,
    category: "Food & Beverages",
    stock: 80,
    images: ["https://example.com/images/palm-oil.jpg"],
  },
  {
    name: "Garri - Premium Quality",
    description:
      "Premium quality garri (cassava flakes), 10kg bag, perfect for eba",
    price: 3500,
    category: "Food & Beverages",
    stock: 120,
    images: ["https://example.com/images/garri.jpg"],
  },
  {
    name: "Inverter Generator 5.5KVA",
    description:
      "Silent inverter generator, 5.5KVA capacity, fuel efficient, perfect for home use",
    price: 450000,
    category: "Home & Appliances",
    stock: 12,
    images: ["https://example.com/images/inverter-generator.jpg"],
  },
  {
    name: "Solar Panel Kit 200W",
    description:
      "Complete solar panel kit with battery, inverter, and charge controller, 200W capacity",
    price: 180000,
    category: "Home & Appliances",
    stock: 20,
    images: ["https://example.com/images/solar-panel-kit.jpg"],
  },
  {
    name: "Deep Freezer 200 Litres",
    description:
      "Upright deep freezer, 200 litres capacity, energy efficient, frost-free",
    price: 125000,
    category: "Home & Appliances",
    stock: 18,
    images: ["https://example.com/images/deep-freezer.jpg"],
  },
  {
    name: "Air Conditioner 1.5HP",
    description:
      "Split unit air conditioner, 1.5HP, inverter technology, energy saving",
    price: 280000,
    category: "Home & Appliances",
    stock: 15,
    images: ["https://example.com/images/air-conditioner.jpg"],
  },
  {
    name: "Nigerian Literature Collection",
    description:
      "Set of 5 classic Nigerian literature books including works by Chinua Achebe and Wole Soyinka",
    price: 12000,
    category: "Books",
    stock: 40,
    images: ["https://example.com/images/nigerian-literature.jpg"],
  },
  {
    name: "African Print Fabric - 6 Yards",
    description:
      "Premium Ankara fabric, 6 yards, various patterns available, 100% cotton",
    price: 8000,
    category: "Fashion",
    stock: 60,
    images: ["https://example.com/images/ankara-fabric.jpg"],
  },
  {
    name: "Wireless Bluetooth Earbuds",
    description:
      "True wireless earbuds, noise cancellation, 30-hour battery life, IPX7 waterproof",
    price: 25000,
    category: "Electronics",
    stock: 35,
    images: ["https://example.com/images/wireless-earbuds.jpg"],
  },
  {
    name: "Smart TV 55-inch",
    description:
      "55-inch 4K Ultra HD Smart TV, Android TV, HDR support, voice control",
    price: 320000,
    category: "Electronics",
    stock: 10,
    images: ["https://example.com/images/smart-tv-55.jpg"],
  },
  {
    name: "Nigerian Spice Collection",
    description:
      "Premium Nigerian spice collection including curry, thyme, bay leaves, and more, 10-piece set",
    price: 5000,
    category: "Food & Beverages",
    stock: 90,
    images: ["https://example.com/images/spice-collection.jpg"],
  },
  {
    name: "Traditional Beaded Jewelry Set",
    description:
      "Handmade Nigerian beaded jewelry set including necklace, bracelet, and earrings",
    price: 15000,
    category: "Fashion",
    stock: 25,
    images: ["https://example.com/images/beaded-jewelry.jpg"],
  },
  {
    name: "Laptop Backpack",
    description:
      "Durable laptop backpack, fits up to 15.6-inch laptop, multiple compartments, water resistant",
    price: 12000,
    category: "Accessories",
    stock: 45,
    images: ["https://example.com/images/laptop-backpack.jpg"],
  },
  {
    name: "Power Bank 20000mAh",
    description:
      "High capacity power bank, 20000mAh, fast charging, dual USB ports, LED indicator",
    price: 18000,
    category: "Electronics",
    stock: 50,
    images: ["https://example.com/images/power-bank.jpg"],
  },
  {
    name: "Nigerian Cookbook",
    description:
      "Complete guide to Nigerian cuisine with 100+ traditional recipes, hardcover",
    price: 8500,
    category: "Books",
    stock: 30,
    images: ["https://example.com/images/nigerian-cookbook.jpg"],
  },
];

async function main() {
  console.log("Starting product seed...");

  let createdCount = 0;
  let skippedCount = 0;

  for (const productData of seedProducts) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: productData.name },
    });

    if (existingProduct) {
      console.log(`Product "${productData.name}" already exists, skipping...`);
      skippedCount++;
      continue;
    }

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        stock: productData.stock,
        images: productData.images,
      },
    });

    console.log(
      `Created product: ${product.name} (${
        product.category
      }) - ₦${product.price.toLocaleString()}`
    );
    createdCount++;
  }

  console.log(`\nSeed completed!`);
  console.log(`Created: ${createdCount} products`);
  console.log(`Skipped: ${skippedCount} products (already exist)`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
