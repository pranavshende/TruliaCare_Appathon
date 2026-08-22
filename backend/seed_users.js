const prisma = require('./prismaClient');
const argon2 = require('argon2');

async function seedUsers() {
  try {
    const passwordHash = await argon2.hash('Password@123');

    const usersToSeed = [
      { email: 'admin@gmail.com', name: 'Admin User', role: 'ADMIN', password: passwordHash },
      { email: 'technician@gmail.com', name: 'Tech User', role: 'TECHNICIAN', password: passwordHash },
      { email: 'employee@gmail.com', name: 'Emp User', role: 'EMPLOYEE', password: passwordHash }
    ];

    for (const user of usersToSeed) {
      const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
      if (!existingUser) {
        await prisma.user.create({ data: user });
        console.log(`Created user: ${user.email} (${user.role})`);
      } else {
        // Update password if they already exist
        await prisma.user.update({
          where: { email: user.email },
          data: { password: passwordHash, role: user.role }
        });
        console.log(`Updated user: ${user.email} (${user.role})`);
      }
    }
    
    console.log('Seeding complete!');
  } catch (err) {
    console.error('Error seeding users:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
