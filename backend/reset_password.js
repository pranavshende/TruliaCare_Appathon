const prisma = require('./prismaClient');
const argon2 = require('argon2');

async function resetPassword() {
  const email = 'pranavshende97@gmail.com';
  const newPassword = 'Password@123';

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    console.log(`Hashing new password for ${email}...`);
    const hashedPassword = await argon2.hash(newPassword);

    console.log('Updating database...');
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { password: hashedPassword }
    });

    console.log(`Successfully reset password to ${newPassword}`);
  } catch (err) {
    console.error("Error resetting password:", err);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
