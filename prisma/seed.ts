import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = ["admin", "user"];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  await prisma.user.upsert({
    where:{email:"admin@example.com"},
    update:{},
    create:{
      firstName:"Admin",
      lastName:"User",
      email:"admin@example.com",
      passwordHash:"$2a$10$ObZ2WCMKqKsJE4fHEQIGz.8yNoQPmf6EJexBImdhqNOGledE06HdC",
      roleId:1,
    }
  })
  console.log("Roles Seeded Successfully");
  console.log("Admin User Seeded Successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });