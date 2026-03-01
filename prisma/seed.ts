import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import cuid from "cuid";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed Roles — manually provide id
  const roles = ["admin", "user"];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: {
        id: cuid(),   // ✅ Generate id manually
        name,
      },
    });
  }

  // Fetch admin role id
  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
  });

  if (!adminRole) {
    throw new Error("Admin role not found after seeding");
  }

  // Seed Admin User
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      id: cuid(),         // ✅ Generate id manually
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      passwordHash: "$2a$10$ObZ2WCMKqKsJE4fHEQIGz.8yNoQPmf6EJexBImdhqNOGledE06HdC",
      roleId: adminRole.id,
    },
  });

  console.log("✅ Roles seeded successfully");
  console.log("✅ Admin user seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });