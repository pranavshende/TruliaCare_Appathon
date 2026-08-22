const prisma = require('./prismaClient');
const argon2 = require('argon2');

async function main() {
  const hashedPassword = await argon2.hash('Password@123');

  const users = [
    { email: 'pranavshende97@gmail.com', name: 'Pranav', role: 'EMPLOYEE' },
    { email: 'hannaturkey15@gmail.com', name: 'Hanna', role: 'TECHNICIAN' },
    { email: 'mayankgotmare0915@gmail.com', name: 'Mayank', role: 'ADMIN' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { password: hashedPassword, role: user.role, name: user.name },
      create: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: user.role,
      },
    });
    console.log(`Seeded user: ${user.email} as ${user.role}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
