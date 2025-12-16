import dotenv from "dotenv";
import path from "path";

const rootEnvPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: rootEnvPath });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: "customer" | "admin";
  address?: string;
  phone?: string;
}

const seedUsers: SeedUser[] = [
  {
    email: "adebayo.ogunleye@example.com",
    password: "SecurePass123!",
    name: "Adebayo Ogunleye",
    role: "customer",
    address: "Lagos, Nigeria",
    phone: "+2348012345678",
  },
  {
    email: "chioma.okonkwo@test.com",
    password: "TestPassword456",
    name: "Chioma Okonkwo",
    role: "customer",
    address: "Abuja, Nigeria",
    phone: "+2348023456789",
  },
  {
    email: "emeka.nwankwo@demo.io",
    password: "DemoPass789",
    name: "Emeka Nwankwo",
    role: "customer",
    address: "Port Harcourt, Nigeria",
    phone: "+2348034567890",
  },
  {
    email: "funke.adeyemi@test.com",
    password: "FunkePass123",
    name: "Funke Adeyemi",
    role: "customer",
    address: "Ibadan, Nigeria",
    phone: "+2348045678901",
  },
  {
    email: "tunde.bakare@example.com",
    password: "TundePass456",
    name: "Tunde Bakare",
    role: "customer",
    address: "Kano, Nigeria",
    phone: "+2348056789012",
  },
  {
    email: "kemi.adeleke@test.com",
    password: "KemiPass123",
    name: "Kemi Adeleke",
    role: "customer",
    address: "Abeokuta, Nigeria",
    phone: "+2348067890123",
  },
  {
    email: "segun.oyekunle@example.com",
    password: "SegunPass456",
    name: "Segun Oyekunle",
    role: "customer",
    address: "Ilorin, Nigeria",
    phone: "+2348078901234",
  },
  {
    email: "amara.igwe@test.com",
    password: "AmaraPass789",
    name: "Amara Igwe",
    role: "customer",
    address: "Enugu, Nigeria",
    phone: "+2348089012345",
  },
  {
    email: "yusuf.mohammed@example.com",
    password: "YusufPass123",
    name: "Yusuf Mohammed",
    role: "customer",
    address: "Kaduna, Nigeria",
    phone: "+2348090123456",
  },
  {
    email: "admin@ecommerce.ng",
    password: "AdminPass123!",
    name: "Oluwaseun Adebayo",
    role: "admin",
    address: "Lagos, Nigeria",
    phone: "+2348101234567",
  },
  {
    email: "superadmin@ecommerce.ng",
    password: "SuperAdmin456!",
    name: "Ngozi Eze",
    role: "admin",
    address: "Abuja, Nigeria",
    phone: "+2348112345678",
  },
];

async function main() {
  console.log("Starting seed...");

  for (const userData of seedUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`User ${userData.email} already exists, skipping...`);
      continue;
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        role: userData.role,
        profile: {
          create: {
            name: userData.name,
            address: userData.address,
            phone: userData.phone,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    console.log(`Created user: ${user.email} (${user.role})`);
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


