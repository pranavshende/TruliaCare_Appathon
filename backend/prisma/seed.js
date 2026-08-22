const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const prisma = new PrismaClient();

async function main() {
  const password = await argon2.hash('password123');

  // Employee
  const employee = await prisma.user.upsert({
    where: { email: 'employee@test.com' },
    update: {},
    create: {
      email: 'employee@test.com',
      name: 'Test Employee',
      password: password,
      role: 'EMPLOYEE',
    },
  });

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Test Admin',
      password: password,
      role: 'ADMIN',
    },
  });

  // Technician
  const tech = await prisma.user.upsert({
    where: { email: 'tech@test.com' },
    update: {},
    create: {
      email: 'tech@test.com',
      name: 'Test Technician',
      password: password,
      role: 'TECHNICIAN',
    },
  });

  console.log({ employee, admin, tech });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
